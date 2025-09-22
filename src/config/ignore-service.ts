/**
 * Centralized Ignore Service
 * 
 * Provides robust file and directory filtering based on centralized configuration.
 * Implements the same logic as the Python example with directory-component matching.
 */

import { configLoader, type ValidatedGitNexusConfig } from './config-loader.ts';

export class IgnoreService {
  private static instance: IgnoreService;
  private config: ValidatedGitNexusConfig | null = null;
  private patternsSet: Set<string> = new Set();
  private suffixesSet: Set<string> = new Set();
  private extensionsSet: Set<string> = new Set();
  private customRegexes: RegExp[] = [];

  private constructor() {}

  public static getInstance(): IgnoreService {
    if (!IgnoreService.instance) {
      IgnoreService.instance = new IgnoreService();
    }
    return IgnoreService.instance;
  }

  /**
   * Initialize the ignore service with configuration
   */
  public async initialize(): Promise<void> {
    this.config = await configLoader.loadConfig();
    this.updatePatterns();
  }

  /**
   * Update internal pattern sets from configuration
   */
  private updatePatterns(): void {
    if (!this.config) return;

    const { ignore } = this.config;

    // Convert patterns to lowercase Set for O(1) lookup
    this.patternsSet = new Set(ignore.patterns.map(p => p.toLowerCase()));
    this.suffixesSet = new Set(ignore.suffixes.map(s => s.toLowerCase()));
    this.extensionsSet = new Set(ignore.fileExtensions.map(e => e.toLowerCase()));

    // Compile custom regex patterns
    this.customRegexes = ignore.customPatterns
      .map(pattern => {
        try {
          return new RegExp(pattern, 'i');
        } catch (error) {
          console.warn(`Invalid regex pattern: ${pattern}`, error);
          return null;
        }
      })
      .filter((regex): regex is RegExp => regex !== null);

    console.log(`🔧 IgnoreService initialized with ${this.patternsSet.size} patterns, ${this.suffixesSet.size} suffixes, ${this.extensionsSet.size} extensions`);
  }

  /**
   * Check if a file path should be ignored
   * 
   * Uses directory-component matching like the Python example:
   * - Splits path into components
   * - Checks each component against ignore patterns
   * - Prevents false positives (e.g., "my_node_modules_notes.txt")
   */
  public shouldIgnorePath(filePath: string): boolean {
    if (!this.config?.ignore.enabled) {
      return false;
    }

    // Normalize path separators and remove leading/trailing slashes
    const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
    
    // Split path into components for directory-part matching
    const pathComponents = normalizedPath.split('/').filter(Boolean);

    // Check each component against ignore patterns (case-insensitive)
    for (const component of pathComponents) {
      const lowerComponent = component.toLowerCase();
      
      if (this.patternsSet.has(lowerComponent)) {
        return true;
      }
    }

    // Check file suffixes
    const lowerPath = normalizedPath.toLowerCase();
    for (const suffix of this.suffixesSet) {
      if (lowerPath.endsWith(suffix)) {
        return true;
      }
    }

    // Check file extensions
    const fileName = pathComponents[pathComponents.length - 1] || '';
    const lowerFileName = fileName.toLowerCase();
    
    for (const ext of this.extensionsSet) {
      if (lowerFileName.endsWith(ext)) {
        return true;
      }
    }

    // Check custom regex patterns
    for (const regex of this.customRegexes) {
      if (regex.test(normalizedPath)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Filter an array of paths, removing ignored ones
   * 
   * Optimized for batch processing with early returns
   */
  public filterPaths(paths: string[]): string[] {
    if (!this.config?.ignore.enabled) {
      return paths;
    }

    const startTime = performance.now();
    const filtered = paths.filter(path => !this.shouldIgnorePath(path));
    const endTime = performance.now();

    const filteredCount = paths.length - filtered.length;
    if (filteredCount > 0) {
      console.log(`🚫 IgnoreService filtered ${filteredCount}/${paths.length} paths in ${(endTime - startTime).toFixed(2)}ms`);
    }

    return filtered;
  }

  /**
   * Check if a directory should be ignored
   * 
   * Specialized method for directory filtering during traversal
   */
  public shouldIgnoreDirectory(dirPath: string): boolean {
    if (!this.config?.ignore.enabled) {
      return false;
    }

    // For directories, we only check the directory name itself
    const dirName = dirPath.split('/').pop()?.toLowerCase() || '';
    return this.patternsSet.has(dirName);
  }

  /**
   * Get current ignore statistics
   */
  public getStats(): {
    enabled: boolean;
    patterns: number;
    suffixes: number;
    extensions: number;
    customPatterns: number;
  } {
    return {
      enabled: this.config?.ignore.enabled ?? false,
      patterns: this.patternsSet.size,
      suffixes: this.suffixesSet.size,
      extensions: this.extensionsSet.size,
      customPatterns: this.customRegexes.length
    };
  }

  /**
   * Update ignore patterns at runtime
   */
  public updateIgnorePatterns(updates: Partial<ValidatedGitNexusConfig['ignore']>): void {
    if (!this.config) return;

    // Update configuration
    this.config.ignore = { ...this.config.ignore, ...updates };
    
    // Rebuild pattern sets
    this.updatePatterns();
    
    console.log('🔄 IgnoreService patterns updated');
  }

  /**
   * Add custom patterns at runtime
   */
  public addCustomPatterns(patterns: string[], type: 'patterns' | 'suffixes' | 'extensions' | 'regex' = 'patterns'): void {
    if (!this.config) return;

    switch (type) {
      case 'patterns':
        this.config.ignore.patterns.push(...patterns);
        break;
      case 'suffixes':
        this.config.ignore.suffixes.push(...patterns);
        break;
      case 'extensions':
        this.config.ignore.fileExtensions.push(...patterns);
        break;
      case 'regex':
        this.config.ignore.customPatterns.push(...patterns);
        break;
    }

    this.updatePatterns();
    console.log(`➕ Added ${patterns.length} ${type} to IgnoreService`);
  }

  /**
   * Test a path against ignore patterns (for debugging)
   */
  public testPath(filePath: string): {
    ignored: boolean;
    reason?: string;
    matchedPattern?: string;
  } {
    if (!this.config?.ignore.enabled) {
      return { ignored: false };
    }

    const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
    const pathComponents = normalizedPath.split('/').filter(Boolean);

    // Check directory components
    for (const component of pathComponents) {
      const lowerComponent = component.toLowerCase();
      if (this.patternsSet.has(lowerComponent)) {
        return {
          ignored: true,
          reason: 'directory pattern',
          matchedPattern: component
        };
      }
    }

    // Check suffixes
    const lowerPath = normalizedPath.toLowerCase();
    for (const suffix of this.suffixesSet) {
      if (lowerPath.endsWith(suffix)) {
        return {
          ignored: true,
          reason: 'file suffix',
          matchedPattern: suffix
        };
      }
    }

    // Check extensions
    const fileName = pathComponents[pathComponents.length - 1] || '';
    const lowerFileName = fileName.toLowerCase();
    for (const ext of this.extensionsSet) {
      if (lowerFileName.endsWith(ext)) {
        return {
          ignored: true,
          reason: 'file extension',
          matchedPattern: ext
        };
      }
    }

    // Check regex patterns
    for (let i = 0; i < this.customRegexes.length; i++) {
      const regex = this.customRegexes[i];
      if (regex.test(normalizedPath)) {
        return {
          ignored: true,
          reason: 'custom regex',
          matchedPattern: this.config.ignore.customPatterns[i]
        };
      }
    }

    return { ignored: false };
  }
}

// Export singleton instance
export const ignoreService = IgnoreService.getInstance();
