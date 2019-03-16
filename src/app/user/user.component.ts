import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { UserService } from './user.service';
import { User } from './user';
import { ToasterConfig, Toast, BodyOutputType, ToasterService } from 'angular2-toaster';
import { ActivatedRoute, Router } from '@angular/router';
import { EventEmiterService } from '../shared/event-emitter.service';
import * as moment from 'moment';
import { slideIn } from '../shared/animation';
import { RoleService } from '../setting/role/role.service';
import { Role } from '../setting/role/role';
import { PasswordValidation } from './passwordValidation';
import { CustomValidators } from '../shared/customevalidators';
declare var require: any;
declare var jquery: any;
declare var $: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  providers: [
    { provide: 'Window', useValue: window }, UserService, RoleService
  ],
  animations: [slideIn]
})
export class UserComponent implements OnInit, AfterViewInit {
  show = false;
  pageIndex = 1;
  totalUsers = 0;
  form: FormGroup;
  roles: Role[];
  formEditMode = false;
  users: User[];
  usersPerPage = 10;
  last_page: number;
  ddlusersPerPage: any;
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
      title: 'User',
      body: message,
      bodyOutputType: BodyOutputType.TrustedHtml
    };
    this.toasterService.pop(toast);
  }
  constructor(private fBuilder: FormBuilder, private toasterService: ToasterService,
    private userService: UserService,
    private routeService: ActivatedRoute, private _eventEmiter: EventEmiterService,
    private _roleService: RoleService) {

    this.routeService.queryParams.filter(params => 'sort' in params)
      .map(params => params)
      .distinctUntilChanged()
      .subscribe(data => {
        this.sortCol = data['sort'];
        this.sortDir = data['dir'];
        this.getUsers(this.usersPerPage, this.pageIndex, '');
      });
    this.sortDir = 'asc';
    this.sortCol = 'id';
    this.ddlusersPerPage = this.usersPerPage;
    this.form = fBuilder.group({
      username: ['', [Validators.required, CustomValidators.nospaceValidator]],
      role: ['', [Validators.required]],
      password: ['', [Validators.required]],
      floor: [''],
      confirmPassword: ['', [Validators.required]],
    }, {
        validator: PasswordValidation.MatchPassword
      });
  }

  ngOnInit() {
    this.getUsers(this.usersPerPage, this.pageIndex, '');
    this.getallRoles();
  }

  ngAfterViewInit(): void {
    this._eventEmiter.emitChange('');
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  exportToPDF() {
    const columns = [
      { title: 'User No', dataKey: '0' },
      { title: 'User Name', dataKey: '1' },
      { title: 'Role', dataKey: '2' },
      { title: 'Floor', dataKey: '3' },
      { title: 'Created Date', dataKey: '4' }
    ];
    const rows = [];
    this.users.forEach(user => {
      rows.push({
        0: user.id,
        1: user.username,
        2: user.role.role,
        3: user.floor === null ? '' : user.floor,
        4: user.created_at
      });
    });

    const doc = new jsPDF('p', 'pt');
    doc.rect(15, 15, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 40, 'S');
    doc.setFontSize(20);
    doc.autoTable(columns, rows, {
      theme: 'grid',
      drawHeaderCell: function (cell, data) {
        cell.styles.textColor = [255, 255, 255];
      },
      pageBreak: 'auto',
      columnStyles: {
        id: { fillColor: [255, 0, 0] }
      },
      addPageContent: function (data) {
        doc.text('Users ', doc.internal.pageSize.width / 2, 35, 'center');
      }
    });
    doc.save('Users.pdf');
  }

  getPage(page: number) {
    this.pageIndex = page;
    this.getUsers(this.usersPerPage, this.pageIndex, '');
  }

  setusersPerPage() {
    this.usersPerPage = this.ddlusersPerPage;
    this.getUsers(this.usersPerPage, this.pageIndex, '');
  }

  getUsers(usersPerPage: number, pageIndex: number, searchkey: any) {
    this.userService.getPaginateUsers(usersPerPage, pageIndex, searchkey, this.sortCol, this.sortDir).subscribe(usersInfo => {
      this.users = usersInfo['data'];
      this.users.forEach(users => {
        const dateFormat = 'YYYY-DD-MM HH:mm:ss';
        const testDateUtc = moment.utc(users.updated_at);
        const localDate = testDateUtc.local();
        users.updated_at = localDate;
      });
      this.totalUsers = usersInfo['total'];
      this.last_page = usersInfo['last_page'];
    }, err => {
      console.log('error');
    });
  }

  OnSubmit() {
    this.form.get('username').markAsDirty();
    this.form.get('role').markAsDirty();
    if (this.formEditMode === true) {
      if (this.form.get('password').value === '' || this.form.get('password').value === null) {
        this.form.get('password').clearValidators();
        this.form.get('password').updateValueAndValidity();
        this.form.get('confirmPassword').clearValidators();
        this.form.get('confirmPassword').updateValueAndValidity();
      }
    }
    // console.log(this.form);
    if (this.form.valid) {
      if (!this.formEditMode === true) {
        this.userService.addUsers(this.form.value).subscribe(
          res => {
            if (res.status === 'inValid') {
              this.popToast(res.errors.users, '51');
            } else {
              this.popToast('User saved successfully', '');
              this.getUsers(this.usersPerPage, this.pageIndex, '');
              this.resetForm();
            }
          },
          error => {
            this.popToast('Unable to save user', '50');
            console.log(error);
          }
        );
      } else {

        this.userService.updateUser(this.form.value, this.editId).subscribe(
          res => {
            if (res.status === 'inValid') {
              this.popToast(res.errors.username, '51');
            } else {
              this.popToast('User updated successfully !!', '');
              this.getUsers(this.usersPerPage, this.pageIndex, '');
              this.resetForm();
              this.show = false;
            }
          },
          err => {
            this.popToast('Unable to update user', '50');
            this.getUsers(this.usersPerPage, this.pageIndex, '');
          }
        );
      }
    }
  }

  getEditUsers(id: string) {
    this.editId = id;
    this.show = true;
    this.formEditMode = true;
    this.userService.getEditUsers(id).subscribe(userdata => {
      this.form.patchValue({
        username: userdata.username,
        floor: userdata.floor,
        role: userdata.role
      });
    }, err => {
      console.log('error');
    });

  }

  deleteUser(id: string) {
    this.userService.deleteUsers(id).subscribe(res => {
      this.popToast('User deleted successfully !!', '');
      this.getUsers(this.usersPerPage, this.pageIndex, '');
    }, err => {
      this.popToast('Unable to delete user', '50');
      this.getUsers(this.usersPerPage, this.pageIndex, '');
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
    this.getUsers(this.usersPerPage, this.pageIndex, value);
  }

  cancel() {
    this.form.reset();
    this.show = false;
    this.formEditMode = false;
  }

  getallRoles() {
    this._roleService.getRoles().subscribe(
      rolesData => {
        this.roles = rolesData;
      },
      err => {
        console.log('err');
      });
  }

}
