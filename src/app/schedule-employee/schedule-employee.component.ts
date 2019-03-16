import { Component, OnInit } from '@angular/core';
import { IMyDpOptions } from 'mydatepicker';
import { Popup } from 'ng2-opd-popup';
import { retry } from 'rxjs/operator/retry';
import { EmployeeService } from '../employee/employee.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { slideIn } from '../shared/animation';


@Component({
  selector: 'app-schedule-employee',
  templateUrl: './schedule-employee.component.html',
  styleUrls: ['./schedule-employee.component.css'],
  animations: [slideIn]
})
export class ScheduleEmployeeComponent implements OnInit {
  datestart: any;
  show = false;
  dateend: any;
  public myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'dd/mm/yyyy',
    height: '28px'
  };
  form: FormGroup;
  model = new Date();
  dateTo = new Date();
  a2eOptions = { format: 'HH:mm:ss' };
  weekdays: String[] = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];
  constructor(private popup: Popup, private _employeeService: EmployeeService,
    private fb: FormBuilder) {
    this.form = fb.group({
      id: [''],
      employeeId: ['', Validators.required],
      start_time: ['00:10:00'],
      end_time: ['00:19:00'],
      workingDays: this.fb.array([])
    });
    // this.form.get('workingDays.0').setValue(true);
  }
  checkboxValue = false;
  employeesWorkinTimes: any;
  employees: any;
  ngOnInit() {
    this.getAllEmployees();
    this.getAllEmployeeWorkingHours();
    this.test();
  }
  getAllEmployees() {
    this._employeeService.getAllEmployees().subscribe(
      res => {
        this.employees = res;
      }
    );
  }
  getAllEmployeeWorkingHours() {
    this._employeeService.getAllEmployeeWorkingTimes().subscribe(
      res => {
        this.employeesWorkinTimes = res;
      },
      err => {
        console.log('error');
      }
    );
  }
  test() {
    const days = this.form.get('workingDays') as FormArray;
    days.push(this.fb.group({
      Mon: false
    }));
    days.push(this.fb.group({
      Tues: false
    }));
    days.push(this.fb.group({
      Wed: false
    }));
    days.push(this.fb.group({
      Thurs: false
    }));
    days.push(this.fb.group({
      Fri: false
    }));
    days.push(this.fb.group({
      Sat: true
    }));
    days.push(this.fb.group({
      Sun: true
    }));
  }
  selectAllchk() {
    this.checkboxValue = true;
  }
  notSelectAllchk() {
    this.checkboxValue = false;
  }
  /**
     * This function is call when time Select
     * @param {any} date It hold meeting time
     * @memberof AddMeetingComponent
     */
  dateToChange(date) {
    this.dateTo = date;
    this.model = date;
  }
  /**
   * call when click on meeting time input field
   * @memberof AddMeetingComponent
   */
  dateClick() {
  }
  onSubmit() {
    console.log(this.form.value);
  }
}
