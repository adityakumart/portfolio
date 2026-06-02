/**
 * INTEGRATION GUIDE - JSON to TypeScript Component
 * Follow these steps to integrate the component into your Angular application
 */

/**
 * Step 1: Update App Routing Module
 * File: src/app/app-routing.module.ts
 */

// Add this route configuration:
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // ... other routes
  {
    path: 'tools',
    children: [
      {
        path: 'json-to-typescript',
        loadChildren: () =>
          import('./modules/JsonToTypeScript/json-to-typescript.module').then(
            (m) => m.JsonToTypeScriptModule
          ),
        data: { title: 'JSON to TypeScript Generator' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

/**
 * Step 2: Ensure Material Icons are Available
 * In src/index.html, add this to the <head> section:
 */

/*
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
*/

/**
 * Step 3: Verify Material Theme is Applied
 * In src/styles.scss or your theme file:
 */

/*
@import '@angular/material/prebuilt-themes/indigo-pink.css';
// OR customize with your own theme

// Ensure flex-layout CSS is available
@import 'css-fx-layout/lib/public-api.css';
*/

/**
 * Step 4: Update Navigation Menu (Optional)
 * In your main navigation component:
 */

/*
<mat-nav-list>
  <mat-list-item routerLink="/tools/json-to-typescript">
    <mat-icon matListItemIcon>transform</mat-icon>
    <span matListItemTitle>JSON to TypeScript</span>
    <span matListItemLine>Convert JSON to TypeScript Interfaces</span>
  </mat-list-item>
</mat-nav-list>
*/

/**
 * Step 5: Access Component Programmatically (Advanced)
 * If you need to use the services directly:
 */

import { Component, OnInit } from '@angular/core';
import { JsonTransformerService } from './modules/JsonToTypeScript/services/json-transformer.service';

@Component({
  selector: 'app-my-component',
  template: `<div>{{ result }}</div>`
})
export class MyComponent implements OnInit {
  result = '';

  constructor(private jsonTransformer: JsonTransformerService) {}

  ngOnInit(): void {
    const json = '{"name": "John", "age": 30}';
    const transformResult = this.jsonTransformer.transformJsonToInterface(
      json,
      'User'
    );

    if (transformResult.success) {
      this.result = transformResult.interface;
    } else {
      console.error(transformResult.error);
    }
  }
}

/**
 * Step 6: Using the Component in Standalone Mode (Angular 14+)
 */

/*
import { Component } from '@angular/core';
import { JsonToTypeScriptModule } from './modules/JsonToTypeScript/json-to-typescript.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JsonToTypeScriptModule],
  template: `<app-json-to-typescript></app-json-to-typescript>`
})
export class AppComponent {}
*/

/**
 * Step 7: Environment-Specific Configuration
 * In src/environments/environment.ts:
 */

export const environment = {
  production: false,
  jsonGeneratorConfig: {
    indentation: 2,
    interfaceSuffix: '',
    exportFormat: 'export'
  }
};

/**
 * TESTING THE INTEGRATION
 * 
 * 1. Run the development server:
 *    ng serve --open
 * 
 * 2. Navigate to: http://localhost:4200/tools/json-to-typescript
 * 
 * 3. Test with sample JSON:
 *    {"name": "Test", "age": 25, "active": true}
 * 
 * 4. Run tests:
 *    ng test
 * 
 * 5. Build for production:
 *    ng build --configuration production
 */

/**
 * TROUBLESHOOTING
 */

/*
Issue: "JsonToTypeScriptModule is not defined"
Solution: Ensure the import path is correct and the module file exists

Issue: Material icons not displaying
Solution: Add Material Icons link to index.html and ensure Material CSS is loaded

Issue: Responsive layout not working
Solution: Verify css-fx-layout package is installed and imported

Issue: Form validation not working
Solution: Ensure ReactiveFormsModule is imported in the JsonToTypeScriptModule

Issue: Snackbar not showing
Solution: Verify MatSnackBarModule is imported and BrowserAnimationsModule is in app.module
*/
