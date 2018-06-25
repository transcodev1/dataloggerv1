import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SettingComponent } from './feature/setting/setting.component';
import { DashboardComponent } from './feature/dashboard/dashboard.component';

import { FormsModule } from '@angular/forms';
import { ServiceService } from './service.service';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './feature/menu/menu.component';
import { TopbarComponent } from './feature/topbar/topbar.component';
import { OverviewComponent } from './feature/overview/overview.component';

import { ChartsModule } from 'ng2-charts';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule} from '@angular/material';
import { RightboxComponent } from './feature/rightbox/rightbox.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


const appRoutes: Routes = [
  {
    path: 'setting',
    component: SettingComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'topbar',
    component:TopbarComponent
  },
  {
    path: 'overview',
    component:OverviewComponent
  }

]

@NgModule({
  declarations: [
    AppComponent,
    SettingComponent,
    DashboardComponent,
    MenuComponent,
    TopbarComponent,
    OverviewComponent,
    RightboxComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ChartsModule,
    BrowserAnimationsModule,MatButtonModule, MatCheckboxModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(appRoutes)
  ],
  exports:[],
  providers: [ServiceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
