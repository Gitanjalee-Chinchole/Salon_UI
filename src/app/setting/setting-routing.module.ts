import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SettingComponent } from './setting.component';
import { RoleComponent } from './role/role.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'setting',
                component: SettingComponent,
                children: [
                    {
                        path: 'role',
                        component: RoleComponent
                    },
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class SettingRoutingModule { }
