import { Routes, Route } from '@angular/router';
import { RouteSeoData } from '../services/seo.service';

/**
 * Strict type definition for individual developer tools
 */
export interface ToolConfig {
  name: string;
  path: string; // Child path segment (e.g., 'formatters/json')
  link: string; // Complete navigation URL (e.g., '/dev-tools/formatters/json')
  loadComponent?: Route['loadComponent']; // Lazy-loaded tool component
  seo?: RouteSeoData; // Optional specific SEO configuration
}

/**
 * Strict type definition for categorizing groups of developer tools (e.g., Formatters)
 */
export interface ToolGroupConfig {
  header: string; // Group name displayed in menus
  tools: ToolConfig[]; // List of tools in this category
}

/**
 * Strict type definition for top-level application routes
 */
export interface AppRouteConfig {
  path: string; // Route path for Angular Router (e.g., 'calculator')
  link: string; // Complete navigation URL (e.g., '/calculator')
  label: string; // Display label in SideNav
  icon: string; // Icon identifier
  loadComponent?: Route['loadComponent']; // Standalone lazy-loaded component
  loadChildren?: Route['loadChildren']; // Lazy-loaded child routing module
  groups?: ToolGroupConfig[]; // Sub-menu groupings (specific to Dev Tools)
  children?: AppRouteConfig[]; // Nested child route configurations
}

/**
 * Centralized list of Dev Tools and their routing configurations.
 * Kept isolated from AppRoutes to prevent namespace pollution.
 */
export const devToolsRoutingList: ToolGroupConfig[] = [
  {
    header: 'Calculator',
    tools: [
      {
        name: 'Percentage Calculator',
        path: 'calculator/percentage',
        link: '/user/dev-tools/calculator/percentage',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/calculator/percentage-calculator/percentage-calculator.component'
          ).then((m) => m.PercentageCalculatorComponent),
      },
      {
        name: 'Experience',
        path: 'calculator/experience',
        link: '/user/dev-tools/calculator/experience',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/calculator/experience/experience.component'
          ).then((m) => m.ExperienceComponent),
      },
      {
        name: 'Timezone Converter',
        path: 'calculator/timezone-converter',
        link: '/user/dev-tools/calculator/timezone-converter',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/calculator/timezone-converter/timezone-converter.component'
          ).then((m) => m.TimezoneConverterComponent),
      },
    ],
  },
  {
    header: 'Formatters',
    tools: [
      {
        name: 'JSON',
        path: 'formatters/json',
        link: '/user/dev-tools/formatters/json',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/json-formatter/json-formatter.component'
          ).then((m) => m.JsonFormatterComponent),
      },
      {
        name: 'HTML',
        path: 'formatters/html',
        link: '/user/dev-tools/formatters/html',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/code-formatter/html-formatter/html-formatter.component'
          ).then((m) => m.HtmlFormatterComponent),
      },
      {
        name: 'CSS',
        path: 'formatters/css',
        link: '/user/dev-tools/formatters/css',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/code-formatter/css-formatter/css-formatter.component'
          ).then((m) => m.CssFormatterComponent),
      },
      {
        name: 'JS',
        path: 'formatters/js',
        link: '/user/dev-tools/formatters/js',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/code-formatter/js-formatter/js-formatter.component'
          ).then((m) => m.JsFormatterComponent),
      },
    ],
  },
  {
    header: 'Encode/Decode',
    tools: [
      {
        name: 'Base64',
        path: 'encode-decode/base64',
        link: '/user/dev-tools/encode-decode/base64',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/base64-converter/base64-converter.component'
          ).then((m) => m.Base64ConverterComponent),
      },
      {
        name: 'MD5',
        path: 'encode-decode/md5',
        link: '/user/dev-tools/encode-decode/md5',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/encoder-hash-tools/encoder-hash-tools.component'
          ).then((m) => m.EncoderHashToolsComponent),
      },
      {
        name: 'SHA256',
        path: 'encode-decode/sha256',
        link: '/user/dev-tools/encode-decode/sha256',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/encoder-hash-tools/encoder-hash-tools.component'
          ).then((m) => m.EncoderHashToolsComponent),
      },
      {
        name: 'JWT',
        path: 'encode-decode/jwt',
        link: '/user/dev-tools/encode-decode/jwt',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/jwt-decoder/jwt-decoder.component'
          ).then((m) => m.JwtDecoderComponent),
      },
      {
        name: 'URL',
        path: 'encode-decode/url',
        link: '/user/dev-tools/encode-decode/url',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/encoder-hash-tools/encoder-hash-tools.component'
          ).then((m) => m.EncoderHashToolsComponent),
      },
    ],
  },
  {
    header: 'Converters',
    tools: [
      {
        name: 'JSON to CSV',
        path: 'converters/json-to-csv-ts-schema',
        link: '/user/dev-tools/converters/json-to-csv-ts-schema',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/json-csv-converter/json-csv-converter.component'
          ).then((m) => m.JsonCsvConverterComponent),
      },
      {
        name: 'JSON to TypeScript',
        path: 'converters/json-to-typescript',
        link: '/user/dev-tools/converters/json-to-typescript',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/json-to-typescript/json-to-typescript.component'
          ).then((m) => m.JsonToTypeScriptComponent),
      },
      {
        name: 'Query String',
        path: 'converters/query-string',
        link: '/user/dev-tools/converters/query-string',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/query-string-converter/query-string-converter.component'
          ).then((m) => m.QueryStringConverterComponent),
      },
      {
        name: 'Number Base',
        path: 'converters/number-base',
        link: '/user/dev-tools/converters/number-base',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/number-base-converter/number-base-converter.component'
          ).then((m) => m.NumberBaseConverterComponent),
      },
      {
        name: 'Line Splitter',
        path: 'converters/line-splitter',
        link: '/user/dev-tools/converters/line-splitter',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/line-splitter/line-splitter.component'
          ).then((m) => m.LineSplitterComponent),
      },
    ],
  },
  {
    header: 'Generator',
    tools: [
      {
        name: 'Regex',
        path: 'generator/regex',
        link: '/user/dev-tools/generator/regex',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/regex-tester/regex-tester.component'
          ).then((m) => m.RegexTesterComponent),
      },
      {
        name: 'QR',
        path: 'generator/qr',
        link: '/user/dev-tools/generator/qr',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/qr-code-generator/qr-code-generator.component'
          ).then((m) => m.QrCodeGeneratorComponent),
      },
      {
        name: 'Array',
        path: 'generator/array',
        link: '/user/dev-tools/generator/array',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/random-generator/random-generator.component'
          ).then((m) => m.RandomGeneratorComponent),
      },
      {
        name: 'Number',
        path: 'generator/number',
        link: '/user/dev-tools/generator/number',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/random-generator/random-generator.component'
          ).then((m) => m.RandomGeneratorComponent),
      },
      {
        name: 'Objects',
        path: 'generator/objects',
        link: '/user/dev-tools/generator/objects',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/random-generator/random-generator.component'
          ).then((m) => m.RandomGeneratorComponent),
      },
      {
        name: 'UUID',
        path: 'generator/uuid',
        link: '/user/dev-tools/generator/uuid',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/random-generator/random-generator.component'
          ).then((m) => m.RandomGeneratorComponent),
      },
      {
        name: 'Password',
        path: 'generator/password',
        link: '/user/dev-tools/generator/password',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/random-generator/random-generator.component'
          ).then((m) => m.RandomGeneratorComponent),
      },
      {
        name: 'Hash',
        path: 'generator/hash',
        link: '/user/dev-tools/generator/hash',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/random-generator/random-generator.component'
          ).then((m) => m.RandomGeneratorComponent),
      },
    ],
  },
];

/**
 * Single source of truth routing configuration list for main app navigation
 */
export const appRoutingList: AppRouteConfig[] = [
  {
    path: '',
    link: '/',
    label: 'Portfolio',
    icon: 'bolt',
    loadComponent: () =>
      import('../../modules/portfolio/portfolio.component').then(
        (m) => m.PortfolioComponent,
      ),
  },
  {
    path: 'dev-tools',
    link: '/user/dev-tools',
    label: 'Dev Tools',
    icon: 'code_xml',
    groups: devToolsRoutingList,
  },

  {
    path: 'user',
    link: '/user',
    label: 'User',
    icon: 'account_circle',
    loadChildren: () =>
      import('../../modules/user/user-routing.module').then(
        (m) => m.UserRoutingModule,
      ),
  },
  {
    path: 'rr',
    link: '/user/rr',
    label: 'Car Rentals',
    icon: 'directions_car',
    loadChildren: () =>
      import('../../modules/rr/rr-routing.module').then(
        (m) => m.RRRoutingModule,
      ),
  },
];

/**
 * Generates tailored SEO metadata and SoftwareApplication schema configuration for individual developer tools
 */
export function getDefaultToolSeo(tool: ToolConfig): RouteSeoData {
  const toolName = tool.name;
  let title = `${toolName} | Developer Tools | Aditya Kumar T`;
  let description = `Free online ${toolName} tool. Client-side processing, formatting, and conversion in your browser without data transmission.`;
  let keywords = [
    toolName,
    'Developer Tools',
    'Online Utility',
    'Web Tool',
    'Aditya Kumar T',
  ];

  if (toolName === 'Percentage Calculator') {
    title = 'Percentage Calculator | Quick Increase, Decrease & Ratio Tool';
    description =
      'Free online percentage calculator. Calculate percentage increase, decrease, difference, discounts, and fractions instantly.';
    keywords = [
      'Percentage Calculator',
      'Calculate Percent',
      'Discount Calculator',
      'Percentage Increase',
      'Math Tools',
    ];
  } else if (toolName === 'Experience') {
    title = 'Experience & Career Tenure Calculator | Date Range Tool';
    description =
      'Calculate exact career experience, years and months between employment dates, and overall tenure accurately.';
    keywords = [
      'Experience Calculator',
      'Career Tenure',
      'Years of Experience',
      'Date Range Calculator',
    ];
  } else if (toolName === 'Timezone Converter') {
    title = 'Timezone Converter & World Clock | Global Meeting Scheduler';
    description =
      'Convert times across global timezones (UTC, EST, PST, IST, GMT). Plan international meetings and schedule across timezones easily.';
    keywords = [
      'Timezone Converter',
      'World Clock',
      'Convert Time',
      'Meeting Planner',
      'UTC Converter',
    ];
  } else if (toolName === 'JSON') {
    title = 'JSON Formatter, Validator & Beautifier | Free Online Tool';
    description =
      'Format, validate, parse, and beautify JSON strings client-side. Syntax highlighting, error detection, and minify support.';
    keywords = [
      'JSON Formatter',
      'JSON Validator',
      'Beautify JSON',
      'JSON Pretty Print',
      'Developer Tools',
    ];
  } else if (toolName === 'HTML') {
    title = 'HTML Formatter & Beautifier | Online Code Formatter';
    description =
      'Beautify and indent HTML markup online with clean tag formatting and customizable indentation.';
    keywords = [
      'HTML Formatter',
      'Beautify HTML',
      'HTML Pretty Print',
      'Web Formatter',
    ];
  } else if (toolName === 'CSS') {
    title = 'CSS Formatter & Beautifier | Style Sheet Pretty Print';
    description =
      'Format and beautify CSS code online. Clean up stylesheets with consistent rules, indentation, and structure.';
    keywords = [
      'CSS Formatter',
      'Beautify CSS',
      'CSS Beautifier',
      'Clean CSS',
    ];
  } else if (toolName === 'JS') {
    title = 'JavaScript Formatter & Code Beautifier | Online JS Tool';
    description =
      'Format and clean up JavaScript and TypeScript code online with proper indentation and style consistency.';
    keywords = [
      'JavaScript Formatter',
      'JS Beautifier',
      'Beautify JS',
      'Code Formatter',
    ];
  } else if (toolName === 'Base64') {
    title = 'Base64 Encoder & Decoder | Text & Binary Tool';
    description =
      'Encode text or files into Base64 format and decode Base64 strings to UTF-8 plain text securely in the browser.';
    keywords = [
      'Base64 Encoder',
      'Base64 Decoder',
      'Encode Base64',
      'Decode Base64',
      'Online Base64',
    ];
  } else if (toolName === 'MD5') {
    title = 'MD5 Hash Generator | Online Cryptographic Tool';
    description =
      'Generate cryptographic MD5 checksums and hash digests from text input securely in your browser.';
    keywords = [
      'MD5 Hash Generator',
      'MD5 Checksum',
      'Generate MD5',
      'Hash Tool',
    ];
  } else if (toolName === 'SHA256') {
    title = 'SHA-256 Hash Generator | Secure Cryptographic Hasher';
    description =
      'Generate SHA-256 cryptographic hashes from text data instantly. Client-side cryptographic hash calculation.';
    keywords = [
      'SHA256 Hash Generator',
      'SHA 256 Online',
      'Crypto Hash',
      'SHA256 Checksum',
    ];
  } else if (toolName === 'JWT') {
    title = 'JWT Decoder & Token Inspector | Client-Side Security Tool';
    description =
      'Decode JSON Web Tokens (JWT) client-side. Inspect token header, claims payload, signature, and expiration safely without sending tokens over the network.';
    keywords = [
      'JWT Decoder',
      'Inspect JWT',
      'Decode JWT Token',
      'JSON Web Token',
      'JWT Inspector',
    ];
  } else if (toolName === 'URL') {
    title = 'URL Percent-Encoder & Decoder | Query String Tool';
    description =
      'Encode and decode URL parameters and URI strings safely with standard percent-encoding.';
    keywords = [
      'URL Encoder',
      'URL Decoder',
      'Percent Encoding',
      'URI Decode',
    ];
  } else if (toolName === 'JSON to CSV') {
    title = 'JSON to CSV & Schema Converter | Data Transformation Tool';
    description =
      'Convert JSON arrays and objects into CSV format or schema definitions. Download spreadsheet-ready CSVs client-side.';
    keywords = [
      'JSON to CSV',
      'Convert JSON to CSV',
      'JSON Converter',
      'Data Converter',
    ];
  } else if (toolName === 'JSON to TypeScript') {
    title = 'JSON to TypeScript Interface Converter | Free Online Generator';
    description =
      'Convert raw JSON objects into strongly-typed TypeScript interfaces with recursive nested type inference and export options.';
    keywords = [
      'JSON to TypeScript',
      'Generate TS Interface',
      'JSON to Typescript Converter',
      'TS Interface Generator',
    ];
  } else if (toolName === 'Query String') {
    title = 'URL Query String to Object Converter | Parameter Parser';
    description =
      'Parse URL query parameter strings into structured JSON objects and serialize JSON back into query strings.';
    keywords = [
      'Query String Converter',
      'Parse URL Params',
      'Query to JSON',
      'URL Parameters',
    ];
  } else if (toolName === 'Number Base') {
    title = 'Number Base Converter | Binary, Hex, Octal & Decimal';
    description =
      'Convert numbers between Binary (Base 2), Octal (Base 8), Decimal (Base 10), and Hexadecimal (Base 16) instantly.';
    keywords = [
      'Number Base Converter',
      'Binary to Decimal',
      'Hex to Decimal',
      'Octal Converter',
    ];
  } else if (toolName === 'Line Splitter') {
    title = 'Line Splitter & Delimiter Tool | Text Manipulation Utility';
    description =
      'Split lines, add delimiters, wrap lines, remove duplicates, and batch manipulate text lists online.';
    keywords = [
      'Line Splitter',
      'Text Delimiter',
      'Split Text',
      'Line Break Tool',
    ];
  } else if (toolName === 'Regex') {
    title = 'Regex Tester & Pattern Matcher | Regular Expression Tool';
    description =
      'Test and debug JavaScript regular expressions in real-time with match highlights, flags, and regex cheat sheets.';
    keywords = [
      'Regex Tester',
      'Regular Expression Tester',
      'Regex Matcher',
      'JavaScript Regex',
    ];
  } else if (toolName === 'QR') {
    title = 'QR Code Generator | Create Custom Downloadable QR Codes';
    description =
      'Generate customizable QR codes for URLs, WiFi, contact info, and plain text. Download high-resolution PNG or SVG codes.';
    keywords = [
      'QR Code Generator',
      'Create QR Code',
      'Free QR Generator',
      'Download QR',
    ];
  } else if (toolName === 'Array') {
    title = 'Random Array Generator | Mock Test Data Utility';
    description =
      'Generate randomized arrays of numbers, strings, and mock data for testing algorithms and prototypes.';
    keywords = [
      'Random Array Generator',
      'Mock Array Data',
      'Test Data Generator',
    ];
  } else if (toolName === 'Number') {
    title = 'Random Number Generator | Range & Seed Number Utility';
    description =
      'Generate cryptographically secure random integers or floats within custom ranges.';
    keywords = [
      'Random Number Generator',
      'RNG',
      'Random Integer',
      'Pick Random Number',
    ];
  } else if (toolName === 'Objects') {
    title = 'Random JSON Object Generator | Mock Schema Tool';
    description =
      'Generate realistic mock JSON objects and schema-based random payloads for API testing.';
    keywords = [
      'Mock JSON Generator',
      'Random Object Generator',
      'API Mock Data',
    ];
  } else if (toolName === 'UUID') {
    title = 'UUID / GUID Generator (v4) | Bulk Unique ID Tool';
    description =
      'Generate random cryptographically secure UUID v4 (Universally Unique Identifiers) in single or bulk batches.';
    keywords = [
      'UUID Generator',
      'GUID Generator',
      'UUID v4',
      'Generate Unique ID',
    ];
  } else if (toolName === 'Password') {
    title = 'Secure Password Generator | Strong Random Password Creator';
    description =
      'Generate strong, cryptographically secure passwords with custom length, symbols, numbers, and entropy calculation.';
    keywords = [
      'Password Generator',
      'Secure Password',
      'Random Password Generator',
      'Strong Password',
    ];
  } else if (toolName === 'Hash') {
    title = 'Random Hash Generator | Developer Testing Tool';
    description =
      'Generate random hashes, tokens, and cryptographic strings for testing, dummy tokens, and keys.';
    keywords = [
      'Random Hash Generator',
      'Random Hash',
      'Generate Hash Token',
    ];
  }

  return {
    title,
    description,
    keywords,
    robots: 'index, follow',
    ogType: 'website',
    applicationCategory: 'DeveloperApplication',
  };
}

/**
 * Dynamically builds Angular Routes configuration for Dev Tools child routes from the centralized configuration
 * @param groups The tool groups configuration list
 */
export function buildDevToolsChildRoutes(groups: ToolGroupConfig[]): Routes {
  const routes: Routes = [];

  for (const group of groups) {
    for (const tool of group.tools) {
      if (tool.loadComponent) {
        routes.push({
          path: tool.path,
          loadComponent: tool.loadComponent,
          data: {
            seo: tool.seo || getDefaultToolSeo(tool),
          },
        });
      }
    }
  }

  return routes;
}
