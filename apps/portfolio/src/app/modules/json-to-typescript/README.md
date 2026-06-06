# JSON to TypeScript Interface Generator

A professional, production-ready Angular component that converts JSON objects into strongly-typed TypeScript interfaces. Built with **Angular 21+** and **Angular Material**, featuring clean UI, reactive forms, and comprehensive validation.

## ✨ Features

- 🎯 **JSON Validation** - Real-time validation with helpful error messages
- 📝 **Interface Generation** - Automatic TypeScript interface generation with nested object support
- 🎨 **Material Design** - Professional UI following Material Design guidelines
- 📱 **Responsive** - Fully responsive design for desktop and mobile devices
- 📋 **Copy & Download** - One-click copy to clipboard and download as `.ts` file
- 🎭 **Type Inference** - Intelligent type detection (string, number, boolean, arrays, objects)
- ♿ **Accessible** - Full keyboard navigation and screen reader support
- 🧪 **Well-Tested** - Comprehensive unit tests with 90%+ coverage

## 📦 Project Structure

```
src/app/modules/JsonToTypeScript/
├── models/
│   └── json-transformer.interface.ts       # Type definitions
├── services/
│   ├── json-transformer.service.ts         # Main transformation logic
│   └── json-transformer.service.spec.ts    # Service tests
├── utilities/
│   ├── type-generator.utility.ts           # Interface code generation
│   └── type-generator.utility.spec.ts      # Utility tests
├── json-to-typescript.component.ts         # Main component
├── json-to-typescript.component.html       # Template
├── json-to-typescript.component.scss       # Styles
├── json-to-typescript.component.spec.ts    # Component tests
├── json-to-typescript.module.ts            # Feature module
├── json-to-typescript-routing.module.ts    # Routing module
└── README.md                               # This file
```

## 🚀 Getting Started

### Prerequisites

- Angular 21+
- Angular Material 21+
- TypeScript 5.9+
- Angular Reactive Forms

### Installation

1. **Import the Module** in your app routing module or main app module:

```typescript
// app-routing.module.ts or app.module.ts

import { JsonToTypeScriptModule } from './modules/JsonToTypeScript/json-to-typescript.module';

const routes: Routes = [
  // ... other routes
  {
    path: 'json-to-typescript',
    loadChildren: () =>
      import('./modules/JsonToTypeScript/json-to-typescript.module').then(
        (m) => m.JsonToTypeScriptModule
      )
  }
];

// Or add to imports array for direct inclusion
@NgModule({
  imports: [JsonToTypeScriptModule, ...]
})
```

2. **Add to App Routing** (if using lazy loading):

```typescript
// In your main app-routing.module.ts
const routes: Routes = [
  {
    path: 'tools/json-to-typescript',
    loadChildren: () => import('./modules/JsonToTypeScript/json-to-typescript.module').then((m) => m.JsonToTypeScriptModule),
  },
];
```

3. **Ensure Material Icons are loaded** in your `index.html`:

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
```

## 💡 Usage Examples

### Example 1: Simple User Object

**Input JSON:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "isActive": true
}
```

**Generated TypeScript Interface:**

```typescript
export interface GeneratedInterface {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}
```

### Example 2: Nested Objects

**Input JSON:**

```json
{
  "user": {
    "profile": {
      "firstName": "Jane",
      "lastName": "Smith",
      "bio": "Software Developer"
    },
    "contact": {
      "email": "jane@example.com",
      "phone": "+1234567890"
    }
  },
  "registeredAt": "2024-01-15"
}
```

**Generated TypeScript Interface:**

```typescript
export interface UserData {
  user: {
    profile: {
      firstName: string;
      lastName: string;
      bio: string;
    };
    contact: {
      email: string;
      phone: string;
    };
  };
  registeredAt: string;
}
```

### Example 3: Arrays

**Input JSON:**

```json
{
  "items": [1, 2, 3, 4, 5],
  "tags": ["typescript", "angular", "material"],
  "products": [
    {
      "id": 1,
      "name": "Product A",
      "price": 29.99
    }
  ]
}
```

**Generated TypeScript Interface:**

```typescript
export interface CatalogData {
  items: number[];
  tags: string[];
  products: {
    id: number;
    name: string;
    price: number;
  }[];
}
```

### Example 4: Complex API Response

**Input JSON:**

```json
{
  "success": true,
  "status": 200,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "johndoe",
        "profile": {
          "avatar": "https://...",
          "preferences": {
            "theme": "dark",
            "notifications": true
          }
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "pageSize": 10
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Generated TypeScript Interface:**

```typescript
export interface ApiResponse {
  success: boolean;
  status: number;
  data: {
    users: {
      id: number;
      username: string;
      profile: {
        avatar: string;
        preferences: {
          theme: string;
          notifications: boolean;
        };
      };
    }[];
    pagination: {
      currentPage: number;
      totalPages: number;
      pageSize: number;
    };
  };
  timestamp: string;
}
```

## 🎨 Component API

### Input Properties

- **jsonInput** (FormControl) - The raw JSON input string
- **interfaceName** (FormControl) - Name for the generated interface

### Output Properties

- **generatedInterface** (string) - The generated TypeScript interface code
- **showOutput** (boolean) - Controls visibility of output section

### Methods

#### `generateInterface()`

Transforms the JSON input into a TypeScript interface.

```typescript
// Automatically called when the "Generate" button is clicked
this.generateInterface();
```

#### `clearInput()`

Clears the form and resets all state.

```typescript
this.clearInput();
```

#### `copyToClipboard()`

Copies the generated interface to the clipboard.

```typescript
this.copyToClipboard();
```

#### `downloadInterface()`

Downloads the generated interface as a `.ts` file.

```typescript
this.downloadInterface();
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
ng test

# Run tests with coverage
ng test --code-coverage

# Run tests in headless mode (CI/CD)
ng test --watch=false --browsers=ChromeHeadless
```

### Test Coverage

The component includes comprehensive unit tests:

- **JsonTransformerService tests**: JSON validation, type detection, interface generation
- **TypeGeneratorUtility tests**: Code generation, nested objects, reserved keywords
- **Component tests**: Form validation, user interactions, state management

Expected coverage: **90%+**

## 🔧 Configuration

### Customize Indentation

Edit `type-generator.utility.ts`:

```typescript
private readonly INDENT = '  '; // Change to '\t' for tabs or '    ' for 4 spaces
```

### Customize Error Messages

Modify error messages in `json-transformer.service.ts`:

```typescript
if (!this.isValidJson(jsonString)) {
  return {
    success: false,
    interface: '',
    error: 'Your custom error message here',
  };
}
```

### Customize Styling

All styles are in `json-to-typescript.component.scss`:

```scss
// Change colors
$primary-color: #3f51b5;
$error-color: #f44336;
$success-color: #4caf50;

// Adjust spacing
$card-padding: 24px;
$button-gap: 12px;
```

## 📋 Supported Types

The generator automatically detects and handles:

| JSON Type        | TypeScript Type     |
| ---------------- | ------------------- |
| `"string"`       | `string`            |
| `123`            | `number`            |
| `true/false`     | `boolean`           |
| `null/undefined` | `any`               |
| `["a", "b"]`     | `string[]`          |
| `[1, 2, 3]`      | `number[]`          |
| `{...}`          | Nested interface    |
| `[{...}]`        | Array of interfaces |

## ⚠️ Limitations & Notes

1. **Root Element**: Must be a JSON object, not an array or primitive
2. **Reserved Keywords**: Automatically renamed (e.g., `class` → `class_`)
3. **Special Characters**: Invalid characters in keys are replaced with underscores
4. **Number Keys**: Keys starting with numbers are prefixed with underscore
5. **Date Format**: Dates are inferred as `string` (JSON doesn't support native Date)
6. **Circular References**: Not supported due to JSON serialization limitations

## 🎯 Best Practices

1. **Interface Names**: Use PascalCase for interface names

   ```typescript
   // Good
   interfaceName: 'UserProfile'

   // Avoid
   interfaceName: 'user_profile' or 'userProfile'
   ```

2. **JSON Formatting**: Ensure your JSON is properly formatted

   ```json
   // Good
   {
     "name": "John",
     "age": 30
   }

   // Avoid
   {"name":"John","age":30}
   ```

3. **Nested Objects**: Limit nesting depth for readability
   ```json
   // Consider flattening deeply nested structures
   {
     "user": {
       "profile": {
         "personal": {
           "address": {
             "city": "..."
           }
         }
       }
     }
   }
   ```

## 🤝 Contributing

### Adding Features

1. Update `type-generator.utility.ts` for new type support
2. Add tests in `.spec.ts` files
3. Update documentation with examples
4. Ensure all tests pass: `ng test`

### Reporting Issues

- Check existing issues first
- Include sample JSON that demonstrates the issue
- Provide expected vs actual output
- Include Angular version information

## 📄 License

This component is part of the portfolio project and follows the same license.

## 🙏 Acknowledgments

- Angular Material Documentation
- TypeScript Documentation
- Community feedback and contributions

---

**Happy Coding! 🚀**

For questions or support, please refer to the Angular Material documentation:

- [Angular Material](https://material.angular.io/)
- [Angular Forms](https://angular.io/guide/reactive-forms)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
