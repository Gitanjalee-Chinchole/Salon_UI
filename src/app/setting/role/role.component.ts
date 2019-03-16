import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { RoleService } from './role.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ToasterService, Toast, ToasterConfig, BodyOutputType } from 'angular2-toaster';
import * as moment from 'moment';
import { Role } from './role';
import { slideIn } from '../../shared/animation';
import { ActivatedRoute, Router } from '@angular/router';
import { EventEmiterService } from '../../shared/event-emitter.service';
import { WindowRef } from '../../shared/windowRef';
declare var require: any;
declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
  animations: [slideIn]
})
export class RoleComponent implements OnInit, AfterViewInit {

  show = false;
  pageIndex = 1;
  totalRoles = 0;
  form: FormGroup;
  formEditMode = false;
  roles: Role[];
  rolesPerPage = 10;
  last_page: number;
  ddlrolesPerPage: any;
  searchkey: any;
  sortCol: string;
  sortDir: string;
  queryParams: any;
  editId: string;

  public config1: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-top-right',
    showCloseButton: false,
    tapToDismiss: false,
    animation: 'fade',
    timeout: '2000'
  });
  popToast(message: string, type: string) {
    if (type === '50') {
      type = 'error';
    } else if (type === '51') {
      type = 'warning';
    } else {
      type = 'success';
    }
    const toast: Toast = {
      type: type,
      title: 'Role',
      body: message,
      bodyOutputType: BodyOutputType.TrustedHtml
    };

    this.toasterService.pop(toast);
  }

  constructor(private window: WindowRef, private fBuilder: FormBuilder, private roleService: RoleService,
    private toasterService: ToasterService, private routeService: ActivatedRoute,
    private _eventEmiter: EventEmiterService) {
    this.routeService.queryParams.filter(params => 'sort' in params)
      .map(params => params)
      .distinctUntilChanged()
      .subscribe(data => {
        this.sortCol = data['sort'];
        this.sortDir = data['dir'];
        this.getRoles(this.rolesPerPage, this.pageIndex, '');
      });
    this.sortDir = 'asc';
    this.sortCol = 'id';
    this.ddlrolesPerPage = this.rolesPerPage;
    this.form = fBuilder.group({
      role: ['', Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    this.getRoles(this.rolesPerPage, this.pageIndex, '');
  }

  ngAfterViewInit(): void {
    this._eventEmiter.emitChange('');
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  getPage(page: number) {
    this.pageIndex = page;
    this.getRoles(this.rolesPerPage, this.pageIndex, '');
  }

  setrolesPerPage() {
    this.rolesPerPage = this.ddlrolesPerPage;
    this.getRoles(this.rolesPerPage, this.pageIndex, '');
  }

  getRoles(rolesPerPage: number, pageIndex: number, searchkey: any) {
    this.roleService.getPaginateRoles(rolesPerPage, pageIndex, searchkey, this.sortCol, this.sortDir).subscribe(rol => {
      this.roles = rol['data'];
      this.roles.forEach(roles => {
        const dateFormat = 'YYYY-DD-MM HH:mm:ss';
        const testDateUtc = moment.utc(roles.updated_at);
        const localDate = testDateUtc.local();
        roles.updated_at = localDate;
      });
      this.totalRoles = rol['total'];
      this.last_page = rol['last_page'];
    }, err => {
      console.log('error');
    });

  }
  OnSubmit() {
    // console.log(this.form.valid);
    if (this.form.valid) {
      if (!this.formEditMode === true) {
        this.roleService.addRole(this.form.value).subscribe(
          res => {
            if (res.status === 'inValid') {
              this.popToast(res.errors.role, '51');
            } else {
              this.popToast('saved successfully', '');
              this.getRoles(this.rolesPerPage, this.pageIndex, '');
              this.resetForm();
            }
          },
          error => {

            this.popToast('Unable to save', '50');
            console.log(error);
          }
        );
      } else {
        this.roleService.updateRole(this.form.value, this.editId).subscribe(
          res => {
            if (res.status === 'inValid') {
              this.popToast(res.errors.role, '51');
            } else {
              this.popToast('Role updated successfully !!', '');
              this.getRoles(this.rolesPerPage, this.pageIndex, '');
              this.resetForm();
              this.show = false;
            }
          },
          err => {
            this.popToast('Unable to update role', '50');
            this.getRoles(this.rolesPerPage, this.pageIndex, '');
          }
        );
      }
    }
  }
  getRoleEdit(id: string) {
    this.editId = id;
    this.show = true;
    this.formEditMode = true;
    this.roleService.getRoleEdit(id).subscribe(roledata => {
      this.form.patchValue({
        role: roledata.role,
      });
    }, err => {
      console.log('error');
    });
  }
  deleteRole(id: string) {
    this.roleService.deleteRole(id).subscribe(res => {
      if (res['status'] === 'warning') {
        this.toasterService.pop({ type: 'warning', title: 'Role', body: res['message'], timeout: 1500 });
      } else if (res['status'] === 'success') {
        this.toasterService.pop({ type: 'success', title: 'Role', body: 'Role Deleted Successfully!!', timeout: 1000 });
        this.getRoles(this.rolesPerPage, this.pageIndex, '');
      }
    });
  }

  resetForm() {
    this.show = false;
    this.formEditMode = false;
    this.form.reset();
  }
  reset() {
    this.form.reset();

  }
  onEnter(value: string) {
    this.getRoles(this.rolesPerPage, this.pageIndex, value);
  }
  cancel() {
    this.form.reset();
    this.show = false;
    this.formEditMode = false;
  }
}
