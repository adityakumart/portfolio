# Personal Portfolio

A personal portfolio website built to showcase my projects, skills, and professional experience.

## Features

- **Project Showcase:** A detailed view of my recent work and personal projects.
- **About Me:** Information about my background, education, and core skills.
- **Responsive Design:** Optimized for both desktop and mobile viewing.

## Technologies Used

- [Angular](https://angular.io/) (v16.2.0)
- TypeScript
- HTML5 & SCSS

---

## Angular CLI Development Instructions

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


## Deployment to GitHub Pages

You can use the custom npm script to build the project for GitHub Pages:

```bash
npm run buildgithub
```

Alternatively, manually update `index.html` to include `<base href="/portfolio/">`, then run the following commands:

```bash
ng build
npx angular-cli-ghpages --dir=dist/portfolio
```
