import { Routes, Route } from '@angular/router';
import { Type } from '@angular/core';

/**
 * Strict type definition for individual developer tools
 */
export interface ToolConfig {
  name: string;
  path: string; // Child path segment (e.g., 'formatters/json')
  link: string; // Complete navigation URL (e.g., '/dev-tools/formatters/json')
  loadComponent?: Route['loadComponent']; // Lazy-loaded tool component
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
  icon: string; // Material Icon name
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
        link: '/dev-tools/calculator/percentage',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/calculator/percentage-calculator/percentage-calculator.component'
          ).then((m) => m.PercentageCalculatorComponent),
      },
      {
        name: 'Experience',
        path: 'calculator/experience',
        link: '/dev-tools/calculator/experience',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/calculator/experience/experience.component'
          ).then((m) => m.ExperienceComponent),
      },
      {
        name: 'Timezone Converter',
        path: 'calculator/timezone-converter',
        link: '/dev-tools/calculator/timezone-converter',
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
        link: '/dev-tools/formatters/json',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/json-formatter/json-formatter.component'
          ).then((m) => m.JsonFormatterComponent),
      },
      {
        name: 'HTML',
        path: 'formatters/html',
        link: '/dev-tools/formatters/html',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/code-formatter/html-formatter/html-formatter.component'
          ).then((m) => m.HtmlFormatterComponent),
      },
      {
        name: 'CSS',
        path: 'formatters/css',
        link: '/dev-tools/formatters/css',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/code-formatter/css-formatter/css-formatter.component'
          ).then((m) => m.CssFormatterComponent),
      },
      {
        name: 'JS',
        path: 'formatters/js',
        link: '/dev-tools/formatters/js',
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
        link: '/dev-tools/encode-decode/base64',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/base64-converter/base64-converter.component'
          ).then((m) => m.Base64ConverterComponent),
      },
      {
        name: 'MD5',
        path: 'encode-decode/md5',
        link: '/dev-tools/encode-decode/md5',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/encoder-hash-tools/encoder-hash-tools.component'
          ).then((m) => m.EncoderHashToolsComponent),
      },
      {
        name: 'SHA256',
        path: 'encode-decode/sha256',
        link: '/dev-tools/encode-decode/sha256',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/encoder-hash-tools/encoder-hash-tools.component'
          ).then((m) => m.EncoderHashToolsComponent),
      },
      {
        name: 'JWT',
        path: 'encode-decode/jwt',
        link: '/dev-tools/encode-decode/jwt',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/jwt-decoder/jwt-decoder.component'
          ).then((m) => m.JwtDecoderComponent),
      },
      {
        name: 'URL',
        path: 'encode-decode/url',
        link: '/dev-tools/encode-decode/url',
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
        link: '/dev-tools/converters/json-to-csv-ts-schema',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/json-csv-converter/json-csv-converter.component'
          ).then((m) => m.JsonCsvConverterComponent),
      },
      {
        name: 'JSON to TypeScript',
        path: 'converters/json-to-typescript',
        link: '/dev-tools/converters/json-to-typescript',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/json-to-typescript/json-to-typescript.component'
          ).then((m) => m.JsonToTypeScriptComponent),
      },
      {
        name: 'Query String',
        path: 'converters/query-string',
        link: '/dev-tools/converters/query-string',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/query-string-converter/query-string-converter.component'
          ).then((m) => m.QueryStringConverterComponent),
      },
      {
        name: 'Number Base',
        path: 'converters/number-base',
        link: '/dev-tools/converters/number-base',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/number-base-converter/number-base-converter.component'
          ).then((m) => m.NumberBaseConverterComponent),
      },
      {
        name: 'Line Splitter',
        path: 'converters/line-splitter',
        link: '/dev-tools/converters/line-splitter',
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
        link: '/dev-tools/generator/regex',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/regex-tester/regex-tester.component'
          ).then((m) => m.RegexTesterComponent),
      },
      {
        name: 'QR',
        path: 'generator/qr',
        link: '/dev-tools/generator/qr',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/qr-code-generator/qr-code-generator.component'
          ).then((m) => m.QrCodeGeneratorComponent),
      },
      {
        name: 'Array',
        path: 'generator/array',
        link: '/dev-tools/generator/array',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/random-generator/random-generator.component'
          ).then((m) => m.RandomGeneratorComponent),
      },
      {
        name: 'Number',
        path: 'generator/number',
        link: '/dev-tools/generator/number',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/random-generator/random-generator.component'
          ).then((m) => m.RandomGeneratorComponent),
      },
      {
        name: 'Objects',
        path: 'generator/objects',
        link: '/dev-tools/generator/objects',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/random-generator/random-generator.component'
          ).then((m) => m.RandomGeneratorComponent),
      },
      {
        name: 'UUID',
        path: 'generator/uuid',
        link: '/dev-tools/generator/uuid',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/random-generator/random-generator.component'
          ).then((m) => m.RandomGeneratorComponent),
      },
      {
        name: 'Password',
        path: 'generator/password',
        link: '/dev-tools/generator/password',
        loadComponent: () =>
          import(
            '../../modules/dev-tools/components/random-generator/random-generator.component'
          ).then((m) => m.RandomGeneratorComponent),
      },
      {
        name: 'Hash',
        path: 'generator/hash',
        link: '/dev-tools/generator/hash',
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
    label: 'Home',
    icon: 'home',
    loadComponent: () =>
      import('../../modules/portfolio/portfolio.component').then(
        (m) => m.PortfolioComponent,
      ),
  },
  {
    path: 'dev-tools',
    link: '/dev-tools',
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
    link: '/rr',
    label: 'Car Rentals',
    icon: 'directions_car',
    loadChildren: () =>
      import('../../modules/rr/rr-routing.module').then(
        (m) => m.RRRoutingModule,
      ),
  },
];

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
        });
      }
    }
  }

  return routes;
}
