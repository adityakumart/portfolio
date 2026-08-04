import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DevToolsComponent } from './dev-tools.component';
import { devToolsRoutingList, buildDevToolsChildRoutes } from '../../shared/data/routes';

const routes: Routes = [
  {
    path: '',
    component: DevToolsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'formatters/json' // Default redirect to the first tool
      },
      ...buildDevToolsChildRoutes(devToolsRoutingList)
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevToolsRoutingModule {}
