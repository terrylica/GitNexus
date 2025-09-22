/**
 * GitNexus Configuration
 * 
 * Centralized configuration file for all GitNexus settings.
 * This replaces scattered .env variables and hardcoded values.
 * 
 * Environment variables can still override these values for deployment.
 */

export interface GitNexusConfig {
  // ========================================
  // PROCESSING CONFIGURATION
  // ========================================
  processing: {
    mode: 'parallel' | 'single';
    parallel: {
      maxWorkers: number;
      batchSize: number;
      workerTimeoutMs: number;
    };
    memory: {
      maxMB: number;
      cleanupThresholdMB: number;
      gcIntervalMs: number;
      maxFileSizeMB: number;
      maxFilesInMemory: number;
    };
    fileExtensions: string[];
    performanceMonitoring: boolean;
  };

  // ========================================
  // KUZU DB CONFIGURATION
  // ========================================
  kuzu: {
    enabled: boolean;
    persistence: boolean;
    dualWrite: boolean;
    fallbackToJson: boolean;
    performance: {
      enableCache: boolean;
      cacheSize: number;
      queryTimeout: number;
    };
  };

  // ========================================
  // AI & QUERY CONFIGURATION
  // ========================================
  ai: {
    cypher: {
      defaultLimit: number;
      maxLimit: number;
      timeoutMs: number;
      enableValidation: boolean;
      enableLimiting: boolean; // Enable/disable automatic LIMIT addition
      enableTruncation: boolean; // Enable/disable response truncation
    };
    llm: {
      defaultProvider: 'openai' | 'azure' | 'anthropic' | 'gemini';
      providers: {
        openai?: {
          apiKey?: string;
          model: string;
          maxTokens: number;
          temperature: number;
        };
        azure?: {
          apiKey?: string;
          endpoint?: string;
          deployment?: string;
          maxTokens: number;
          temperature: number;
        };
        anthropic?: {
          apiKey?: string;
          model: string;
          maxTokens: number;
          temperature: number;
        };
        gemini?: {
          apiKey?: string;
          model: string;
          maxTokens: number;
          temperature: number;
        };
      };
    };
  };

  // ========================================
  // IGNORE PATTERNS (CENTRALIZED!)
  // ========================================
  ignore: {
    enabled: boolean;
    patterns: string[];
    suffixes: string[];
    fileExtensions: string[];
    customPatterns: string[];
  };

  // ========================================
  // LOGGING & DEBUGGING
  // ========================================
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
    enablePerformance: boolean;
    maxEntries: number;
    monitoringIntervalMs: number;
  };

  // ========================================
  // GITHUB INTEGRATION
  // ========================================
  github: {
    token?: string;
    apiUrl: string;
    rateLimit: {
      maxRequests: number;
      windowMs: number;
    };
    retry: {
      maxRetries: number;
      backoffMs: number;
    };
  };

  // ========================================
  // ENVIRONMENT & DEPLOYMENT
  // ========================================
  environment: 'development' | 'staging' | 'production';
}

/**
 * Default GitNexus Configuration
 * 
 * These are the default values. Environment variables can override them.
 */
const config: GitNexusConfig = {

  // ========================================
  // PROCESSING CONFIGURATION
  // ========================================
  processing: {
    mode: (process.env.VITE_PARSING_MODE as 'parallel' | 'single') ?? 'parallel',
    parallel: {
      maxWorkers: parseInt(process.env.PARALLEL_MAX_WORKERS ?? '4'),
      batchSize: parseInt(process.env.PARALLEL_BATCH_SIZE ?? '20'),
      workerTimeoutMs: parseInt(process.env.PARALLEL_WORKER_TIMEOUT_MS ?? '60000')
    },
    memory: {
      maxMB: parseInt(process.env.MEMORY_MAX_MB ?? '512'),
      cleanupThresholdMB: parseInt(process.env.MEMORY_CLEANUP_THRESHOLD_MB ?? '400'),
      gcIntervalMs: parseInt(process.env.MEMORY_GC_INTERVAL_MS ?? '30000'),
      maxFileSizeMB: parseInt(process.env.MEMORY_MAX_FILE_SIZE_MB ?? '10'),
      maxFilesInMemory: parseInt(process.env.MEMORY_MAX_FILES ?? '1000')
    },
    fileExtensions: process.env.PROCESSING_FILE_EXTENSIONS?.split(',') ?? [
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.hpp',
      '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.dart',
      '.json', '.yaml', '.yml', '.xml', '.toml', '.ini', '.cfg', '.properties'
    ],
    performanceMonitoring: process.env.PROCESSING_PERFORMANCE_MONITORING !== 'false'
  },

  // ========================================
  // KUZU DB CONFIGURATION
  // ========================================
  kuzu: {
    enabled: process.env.VITE_KUZU_ENABLED === 'true',
    persistence: process.env.KUZU_PERSISTENCE !== 'false',
    dualWrite: process.env.KUZU_DUAL_WRITE !== 'false',
    fallbackToJson: process.env.KUZU_FALLBACK_JSON !== 'false',
    performance: {
      enableCache: process.env.KUZU_ENABLE_CACHE !== 'false',
      cacheSize: parseInt(process.env.KUZU_CACHE_SIZE ?? '1000'),
      queryTimeout: parseInt(process.env.KUZU_QUERY_TIMEOUT ?? '30000')
    }
  },

  // ========================================
  // AI & QUERY CONFIGURATION
  // ========================================
  ai: {
    cypher: {
      defaultLimit: parseInt(process.env.AI_CYPHER_DEFAULT_LIMIT ?? '20'),
      maxLimit: parseInt(process.env.AI_CYPHER_MAX_LIMIT ?? '100'),
      timeoutMs: parseInt(process.env.AI_CYPHER_TIMEOUT_MS ?? '30000'),
      enableValidation: process.env.AI_CYPHER_ENABLE_VALIDATION !== 'false',
      enableLimiting: process.env.AI_CYPHER_ENABLE_LIMITING !== 'false',
      enableTruncation: process.env.AI_CYPHER_ENABLE_TRUNCATION !== 'false'
    },
    llm: {
      defaultProvider: (process.env.LLM_DEFAULT_PROVIDER as 'openai' | 'azure' | 'anthropic' | 'gemini') ?? 'openai',
      providers: {
        openai: process.env.OPENAI_API_KEY ? {
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
          maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS ?? '4000'),
          temperature: parseFloat(process.env.OPENAI_TEMPERATURE ?? '0.1')
        } : undefined,
        azure: process.env.AZURE_API_KEY ? {
          apiKey: process.env.AZURE_API_KEY,
          endpoint: process.env.AZURE_ENDPOINT,
          deployment: process.env.AZURE_DEPLOYMENT,
          maxTokens: parseInt(process.env.AZURE_MAX_TOKENS ?? '4000'),
          temperature: parseFloat(process.env.AZURE_TEMPERATURE ?? '0.1')
        } : undefined,
        anthropic: process.env.ANTHROPIC_API_KEY ? {
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: process.env.ANTHROPIC_MODEL ?? 'claude-3-sonnet-20240229',
          maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS ?? '4000'),
          temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE ?? '0.1')
        } : undefined,
        gemini: process.env.GEMINI_API_KEY ? {
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL ?? 'gemini-pro',
          maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS ?? '4000'),
          temperature: parseFloat(process.env.GEMINI_TEMPERATURE ?? '0.1')
        } : undefined
      }
    }
  },

  // ========================================
  // IGNORE PATTERNS (CENTRALIZED!)
  // ========================================
  ignore: {
    enabled: process.env.IGNORE_ENABLED !== 'false',
    patterns: process.env.IGNORE_PATTERNS?.split(',') ?? [
      // Version Control
      '.git', '.svn', '.hg',
      // Package Managers & Dependencies
      'node_modules', 'bower_components', 'jspm_packages', 'vendor', 'deps',
      // Python Virtual Environments & Cache
      'venv', 'env', '.venv', '.env', 'envs', 'virtualenv', '__pycache__',
      '.pytest_cache', '.mypy_cache', '.tox',
      // Build & Distribution Directories
      'build', 'dist', 'out', 'target', 'bin', 'obj', '.gradle', '_build',
      // Static Assets and Public Directories
      'public', 'assets', 'static',
      // IDE & Editor Directories
      '.vs', '.vscode', '.idea', '.eclipse', '.settings',
      // Temporary & Log Directories
      'tmp', '.tmp', 'temp', 'logs', 'log',
      // Coverage & Testing
      'coverage', '.coverage', 'htmlcov', '.nyc_output',
      // OS & System
      '.DS_Store', 'Thumbs.db',
      // Documentation Build Output
      '_site', '.docusaurus',
      // Cache Directories
      '.cache', '.parcel-cache', '.next', '.nuxt'
    ],
    suffixes: process.env.IGNORE_SUFFIXES?.split(',') ?? ['.tmp', '~', '.bak', '.swp', '.swo'],
    fileExtensions: process.env.IGNORE_FILE_EXTENSIONS?.split(',') ?? [
      // Compiled/Binary
      '.pyc', '.pyo', '.pyd', '.so', '.dll', '.exe', '.jar', '.war', '.ear',
      // Archives
      '.zip', '.tar', '.rar', '.7z', '.gz',
      // Media
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.ico', '.mp4', '.avi', '.mp3', '.wav',
      // Documents
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      // Fonts
      '.woff', '.woff2', '.ttf', '.eot', '.otf',
      // Minified/Generated
      '.min.js', '.min.css', '.map'
    ],
    customPatterns: process.env.IGNORE_CUSTOM_PATTERNS?.split(',') ?? []
  },

  // ========================================
  // LOGGING & DEBUGGING
  // ========================================
  logging: {
    level: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') ?? 'info',
    enableMetrics: process.env.LOG_ENABLE_METRICS !== 'false',
    enablePerformance: process.env.LOG_ENABLE_PERFORMANCE !== 'false',
    maxEntries: parseInt(process.env.LOG_MAX_ENTRIES ?? '1000'),
    monitoringIntervalMs: parseInt(process.env.LOG_MONITORING_INTERVAL_MS ?? '30000')
  },

  // ========================================
  // GITHUB INTEGRATION
  // ========================================
  github: {
    token: process.env.GITHUB_TOKEN,
    apiUrl: process.env.GITHUB_API_URL ?? 'https://api.github.com',
    rateLimit: {
      maxRequests: parseInt(process.env.GITHUB_RATE_LIMIT_MAX ?? '60'),
      windowMs: parseInt(process.env.GITHUB_RATE_LIMIT_WINDOW_MS ?? '60000')
    },
    retry: {
      maxRetries: parseInt(process.env.GITHUB_RETRY_MAX ?? '3'),
      backoffMs: parseInt(process.env.GITHUB_RETRY_BACKOFF_MS ?? '1000')
    }
  },

  // ========================================
  // ENVIRONMENT & DEPLOYMENT
  // ========================================
  environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') ?? 'development'
};

export default config;
