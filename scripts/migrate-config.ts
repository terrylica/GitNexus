#!/usr/bin/env tsx
/**
 * Configuration Migration Script
 * 
 * Helps migrate from .env variables to the new gitnexus.config.ts system.
 * This script analyzes your current .env file and suggests config updates.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface EnvMapping {
  envKey: string;
  configPath: string;
  transform?: (value: string) => any;
}

const ENV_MAPPINGS: EnvMapping[] = [
  // Engine Configuration
  { envKey: 'ENGINE_DEFAULT', configPath: 'engine.default' },
  { envKey: 'ENGINE_LEGACY_ENABLED', configPath: 'engine.legacy.enabled', transform: (v) => v === 'true' },
  { envKey: 'ENGINE_LEGACY_MEMORY_LIMIT_MB', configPath: 'engine.legacy.memoryLimitMB', transform: parseInt },
  { envKey: 'ENGINE_LEGACY_BATCH_SIZE', configPath: 'engine.legacy.batchSize', transform: parseInt },
  
  // Processing Configuration
  { envKey: 'VITE_PARSING_MODE', configPath: 'processing.mode' },
  { envKey: 'PARALLEL_MAX_WORKERS', configPath: 'processing.parallel.maxWorkers', transform: parseInt },
  { envKey: 'PARALLEL_BATCH_SIZE', configPath: 'processing.parallel.batchSize', transform: parseInt },
  { envKey: 'MEMORY_MAX_MB', configPath: 'processing.memory.maxMB', transform: parseInt },
  
  // KuzuDB Configuration
  { envKey: 'VITE_KUZU_ENABLED', configPath: 'kuzu.enabled', transform: (v) => v === 'true' },
  
  // Logging Configuration
  { envKey: 'LOG_LEVEL', configPath: 'logging.level' },
  { envKey: 'LOG_ENABLE_METRICS', configPath: 'logging.enableMetrics', transform: (v) => v === 'true' },
  
  // GitHub Configuration
  { envKey: 'GITHUB_TOKEN', configPath: 'github.token' },
  { envKey: 'GITHUB_API_URL', configPath: 'github.apiUrl' }
];

function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    console.log(`❌ .env file not found at ${filePath}`);
    return {};
  }

  const content = readFileSync(filePath, 'utf-8');
  const env: Record<string, string> = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

function generateConfigSuggestions(env: Record<string, string>): string {
  const suggestions: string[] = [];
  const foundMappings: EnvMapping[] = [];

  // Find matching environment variables
  ENV_MAPPINGS.forEach(mapping => {
    if (env[mapping.envKey]) {
      foundMappings.push(mapping);
    }
  });

  if (foundMappings.length === 0) {
    return 'No matching environment variables found for migration.';
  }

  suggestions.push('// Suggested updates for gitnexus.config.ts based on your .env file:\n');

  foundMappings.forEach(mapping => {
    const envValue = env[mapping.envKey];
    const transformedValue = mapping.transform ? mapping.transform(envValue) : `'${envValue}'`;
    
    suggestions.push(`// ${mapping.envKey}=${envValue}`);
    suggestions.push(`${mapping.configPath}: ${transformedValue},\n`);
  });

  return suggestions.join('\n');
}

function analyzeCurrentConfig(): void {
  console.log('🔍 GitNexus Configuration Migration Analysis\n');

  // Check for .env file
  const envPath = join(process.cwd(), '.env');
  const env = parseEnvFile(envPath);
  
  if (Object.keys(env).length === 0) {
    console.log('No .env file found or it\'s empty.');
    return;
  }

  console.log(`📋 Found ${Object.keys(env).length} environment variables in .env\n`);

  // Generate suggestions
  const suggestions = generateConfigSuggestions(env);
  console.log('💡 Configuration Suggestions:');
  console.log('=' .repeat(50));
  console.log(suggestions);
  console.log('=' .repeat(50));

  // Check if gitnexus.config.ts exists
  const configPath = join(process.cwd(), 'gitnexus.config.ts');
  if (existsSync(configPath)) {
    console.log('\n✅ gitnexus.config.ts already exists');
    console.log('You can update it with the suggestions above.');
  } else {
    console.log('\n⚠️  gitnexus.config.ts not found');
    console.log('Please create it first, then apply the suggestions above.');
  }

  // Show next steps
  console.log('\n📝 Next Steps:');
  console.log('1. Update gitnexus.config.ts with the suggested values');
  console.log('2. Test your application to ensure everything works');
  console.log('3. Consider removing the corresponding .env variables');
  console.log('4. Update your deployment scripts to use the new config system');
}

// Run the analysis
if (require.main === module) {
  analyzeCurrentConfig();
}
