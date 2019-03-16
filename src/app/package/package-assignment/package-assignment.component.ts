import { Component, OnInit } from '@angular/core';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { ToasterConfig, Toast, BodyOutputType, ToasterService } from 'angular2-toaster';
import { CustomerService } from '../../customer/customer.service';
import { Customer } from '../../customer/customer';
import { PackageSetup } from '../package-setup/package-setup';
import { Employee } from '../../employee/employee';
import { PackageSetupService } from '../package-setup/package-setup.service';
import { EmployeeService } from '../../employee/employee.service';
import { slideIn } from '../../shared/animation';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { CustomValidators } from '../../shared/customevalidators';
import { ActivatedRoute } from '@angular/router';
import { PackageAssignmentService } from './package-assignment.service';
import { PackageAssignment } from './package-assignment';
import * as moment from 'moment';
import { ItemService } from '../../item/item.service';

@Component({
  selector: 'app-package-assignment',
  templateUrl: './package-assignment.component.html',
  styleUrls: ['./package-assignment.component.css'],
  animations: [slideIn]
})
export class PackageAssignmentComponent implements OnInit {
  show = false;
  validFrom: any = '';
  validTo: any = '';
  customers: Customer[];
  packages: PackageSetup[];
  employees: Employee[];
  packageAssign: PackageAssignment[];
  packageAssignForm: FormGroup;
  numberofday = 0;
  formEditMode = false;
  editId: string;
  searchKey: any;
  sortCol: string;
  sortDir: string;
  queryParams: any;
  pageIndex = 1;
  ddlitemsPerPage: any;
  itemsPerPage = 10;
  totalItems = 0;
  last_page: number;
  serviceList = [];
  itemIngredients: any;
  packageDetailsItems: any;
  packagesHistory: any[];

  public myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'dd/mm/yyyy',
    height: '28px',

    // width: '130px'
  };
  public config1: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-top-right',
    showCloseButton: false,
    tapToDismiss: false,
    animation: 'fade',
    timeout: '1500',
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
      title: 'Package Assignment',
      body: message,
      bodyOutputType: BodyOutputType.TrustedHtml
    };

    this.toasterService.pop(toast);
  }
  constructor(private fb: FormBuilder, private toasterService: ToasterService, private _customerService: CustomerService,
    private _packageSetupService: PackageSetupService, private _employeeService: EmployeeService,
    private routeService: ActivatedRoute, private packageAssignmentService: PackageAssignmentService,
    private itemService: ItemService) {
    this.routeService.queryParams
      .filter(params => 'sort' in params)
      .map(params => params)
      .distinctUntilChanged()
      .subscribe(data => {
        this.sortCol = data['sort'];
        this.sortDir = data['dir'];
        this.getAllPackageAssign(this.itemsPerPage, this.pageIndex, '');
      });
    this.sortDir = 'asc';
    this.sortCol = 'id';
    this.ddlitemsPerPage = this.itemsPerPage;
    this.packageAssignForm = fb.group({
      'id': [],
      'validFrom': ['', [Validators.required]],
      'validTo': ['', [Validators.required]],
      'customerId': ['', [Validators.required]],
      'customer': [''],
      'packageId': ['', [Validators.required]],
      'package': [''],
      'stylistId': ['', [Validators.required]],
      'stylist': [''],
      'advanceAmount': ['', [CustomValidators.decimalValidate]],
      'index': [''],
      'openingItems': this.fb.array([])
    });
  }

  ngOnInit() {
    this.getAllCustomer();
    this.getAllEmployees();
    this.getAllPackages();
    this.getAllPackageAssign(this.itemsPerPage, this.pageIndex, '');
  }
  setItemsPerPage() {
    this.itemsPerPage = this.ddlitemsPerPage;
    this.getAllPackageAssign(this.itemsPerPage, this.pageIndex, '');
  }
  onEnter(value: string) {
    this.getAllPackageAssign(this.itemsPerPage, this.pageIndex, value);
  }
  getPage(page: number) {
    this.pageIndex = page;
    this.getAllPackageAssign(this.itemsPerPage, this.pageIndex, '');
  }
  getAllPackageAssign(itemsPerPage: number, pageIndex: number, searchkey: any) {
    this.packageAssignmentService.getAllPackageAssign(itemsPerPage, pageIndex, searchkey,
      this.sortCol, this.sortDir).subscribe(
        pgkassign => {
          this.packageAssign = pgkassign['data'];
          this.totalItems = pgkassign['total'];
          this.last_page = pgkassign['last_page'];
        },
        err => { }
      );
  }
  getAllCustomer() {
    this.packageAssignmentService.getAllPackagesAssign().subscribe(
      res => {
        this.customers = res;
      },
      err => {
        console.log('error');
      }
    );
  }
  getAllPackages() {
    this._packageSetupService.getAllPackages().subscribe(
      res => {
        this.packages = res;
      },
      err => {
        console.log('error');
      }
    );
  }
  getAllEmployees() {
    this._employeeService.getAllStylist().subscribe(
      res => {
        this.employees = res;
      },
      err => {
        console.log('error');
      }
    );
  }
  packageSelected(selectedPackage) {
    if (selectedPackage !== '0') {
      const selectedPackageId = parseInt(selectedPackage);
      const Data = this.packages.filter(pack => pack.id === selectedPackageId)[0];
      this.packageAssignForm.get('package').setValue(Data);
      this.numberofday = parseInt(Data.validFor) - 1;
      const todayDate = new Date();
      const toDate1 = new Date();
      this.packageAssignForm.patchValue({
        validFrom: {
          date: {
            year: todayDate.getFullYear(),
            month: todayDate.getMonth() + 1,
            day: todayDate.getDate()
          }
        },
        // validTo: {
        //   date: {
        //     year: toDate.getFullYear(),
        //     month: toDate.getMonth() + 1,
        //     day: toDate.getDate()
        //   }
        // },
      });
    }
  }
  stylistSelected(id) {
    if (id !== '0') {
      const selectedPackageId = parseInt(id);
      const Data = this.employees.filter(emp => emp.id === selectedPackageId);
      this.packageAssignForm.get('stylist').setValue(Data);
    }

  }
  addDays(date: Date, days: number): Date {
    const d = new Date(date.setDate(date.getDate() + days));
    return d;
  }
  onFromDateChanged(event: IMyDateModel) {
    const toDate = new Date(event.date.year, event.date.month - 1, event.date.day);
    const dateto = this.addDays(toDate, this.numberofday);
    this.packageAssignForm.patchValue({
      validTo: {
        date: {
          year: dateto.getFullYear(),
          month: dateto.getMonth() + 1,
          day: dateto.getDate()
        }
      },
    });
  }
  getItemList(): FormArray {
    return <FormArray>this.packageAssignForm.controls['openingItems'];
  }
  getpackagedetial(): FormArray {
    return <FormArray>this.packageAssignForm.controls['openingItems']['packageAssignDetails'];
  }
  addFormArrayList() {
    this.packageAssignForm.get('customerId').markAsDirty();
    this.packageAssignForm.get('packageId').markAsDirty();
    this.packageAssignForm.get('validFrom').markAsDirty();
    this.packageAssignForm.get('validFrom').markAsDirty();
    this.packageAssignForm.get('validTo').markAsDirty();
    this.packageAssignForm.get('stylistId').markAsDirty();
    if (this.packageAssignForm.valid) {
      const ingredient = this.packageAssignForm.value;
      if (typeof (ingredient) !== 'string') {
        if (!this.formEditMode) {
          if (this.serviceList.length !== 0) {
            const duplicate = ingredient.openingItems.filter(item => Number(item.packageId) === Number(ingredient.packageId)
              && item.validTo > this.dateChangeInMoment(ingredient.validFrom));
            if (duplicate.length !== 0) {
              //  const index = ingredient.openingItems.findIndex(x => x.packageId === duplicate[0].packageId);
              this.popToast('Packege already assign to this customer', '51');
            } else {
              this.serviceList.push(ingredient);
              this.itemIngredients = this.getItemList();
              this.itemIngredients.push(this.pushToList(ingredient));
            }
          } else {
            this.serviceList.push(ingredient);
            this.itemIngredients = this.getItemList();
            this.itemIngredients.push(this.pushToList(ingredient));
          }
          //  this.emptyAll();
        } else {
          if (this.serviceList.length !== 0) {
            const duplicate = ingredient.openingItems.filter(item => Number(item.packageId) === Number(ingredient.packageId));
            if (duplicate.length !== 0) {
              // const index = ingredient.openingItems.findIndex(x => x.packageId === duplicate[0].packageId);
              const index = ingredient.index;
              const validfrom = this.dateChangeInMoment(this.packageAssignForm.get('validFrom').value);
              const validto = this.dateChangeInMoment(this.packageAssignForm.get('validTo').value);
              const stylistid = this.packageAssignForm.get('stylistId').value;
              const stylist = this.packageAssignForm.get('stylist').value;
              const advanceamount = this.packageAssignForm.get('advanceAmount').value;
              this.itemIngredients = this.getItemList();
              this.packageAssignForm.get(['openingItems', index, 'validFrom']).setValue(validfrom);
              // this.packageAssignForm.get(['openingItems', index, 'ValidTo']).setValue(validto);
              this.packageAssignForm.get(['openingItems', index, 'stylistId']).setValue(stylistid);
              this.packageAssignForm.get(['openingItems', index, 'stylist']).setValue(stylist);
              this.packageAssignForm.get(['openingItems', index, 'advanceAmount']).setValue(advanceamount);
            } else {

              this.serviceList.push(ingredient);
              this.itemIngredients = this.getItemList();
              this.itemIngredients.push(this.pushToList(ingredient));
            }
          } else {
            this.serviceList.push(ingredient);
            this.itemIngredients = this.getItemList();
            this.itemIngredients.push(this.pushToList(ingredient));
          }
          //  this.emptyAll();
        }
        this.formEditMode = false;
        this.getAllPackages();
      }
    }
  }
  pushToList(item: any): FormGroup {
    let fromdate;
    let todate;
    if (item.validFrom !== '' && item.validFrom !== null) {
      const datefrom = item.validFrom.date;
      fromdate = moment(new Date(datefrom.year, datefrom.month - 1,
        datefrom.day)).format('YYYY-MM-DD');
    }
    if (item.validTo !== '' && item.validTo !== null) {
      const dateto = item.validTo.date;
      todate = moment(new Date(dateto.year, dateto.month - 1,
        dateto.day)).format('YYYY-MM-DD');
    }
    return this.fb.group({
      id: [],
      validFrom: new FormControl(fromdate),
      validTo: new FormControl(todate),
      customerId: new FormControl(item.customerId),
      customer: new FormControl(''),
      packageId: new FormControl(item.packageId),
      package: new FormControl(item.package),
      stylistId: new FormControl(item.stylistId),
      stylist: new FormControl(item.stylist[0]),
      advanceAmount: new FormControl(item.advanceAmount),
      deleted: new FormControl(false),
      packagedetails: [
        this.initPackageDetialsArray(item.package)
      ]
    });
  }
  dateChangeInMoment(d): any {
    let fromdate;
    if (d !== '' && d !== null) {
      const datefrom = d.date;
      fromdate = moment(new Date(datefrom.year, datefrom.month - 1,
        datefrom.day)).format('YYYY-MM-DD');
    }
    return fromdate;
  }
  removePackageAssign(i: number) {
    this.serviceList.splice(i, 1);
    if (this.getItemList().at(i).get('id').value !== '') {
      this.getItemList().at(i).get('deleted').setValue(true);
    } else {
      this.getItemList().removeAt(i);
    }
  }
  initPackageDetialsArray(packageServices): any {
    const pkgServices = [];
    //  this.packageDetailsItems = <FormArray>this.packageAssignForm.controls['openingItems']['packagedetails'];
    if (packageServices['package_services'] !== null) {
      packageServices['package_services'].forEach(pkg => {
        pkgServices.push(
          {
            id: [],
            custPackageId: '',
            itemId: pkg.itemId,
            availed_qty: 0,
            balance_qty: pkg.quantity,
            pkgId: ''
          });
      });
      return pkgServices;
    }
  }
  selectedCustomer(id) {
    this.resetIngredients();
    if (id !== '0') {
      this.packageAssignmentService.getCustomerPackageById(id).subscribe(
        item => {
          // this.nextRecordId = item.id;
          // this.setFormData(item);
          this.itemIngredients = this.getItemList();
          if (item['assign_package'] !== null) {
            item['assign_package'].forEach(ing => {
              this.itemIngredients.push(
                this.fb.group({
                  id: new FormControl(ing.id),
                  validFrom: new FormControl(ing.validFrom),
                  validTo: new FormControl(ing.validTo),
                  package: new FormControl(ing.package),
                  packageId: new FormControl(ing.packageId),
                  customerId: new FormControl(ing.customerId),
                  stylistId: new FormControl(ing.stylistId),
                  stylist: new FormControl(ing.stylist),
                  advanceAmount: new FormControl(ing.advanceAmount),
                  deleted: new FormControl(false),
                  packagedetails: [
                    this.PackageDetials(ing)
                  ]
                })
              );
              this.serviceList.push(ing);
            });
          }
        },
        err => { }
      );
    }
  }
  PackageDetials(packageServicesDetails) {
    const pkgServices = [];
    if (packageServicesDetails['customer_pkg_detail'] !== null) {
      packageServicesDetails['customer_pkg_detail'].forEach(pkg => {
        pkgServices.push(
          {
            id: pkg.id,
            custPackageId: pkg.custPackageId,
            itemId: pkg.itemId,
            availed_qty: pkg.availed_qty,
            balance_qty: pkg.balance_qty,
            pkgId: ''
          });
      });
      return pkgServices;
    }
  }
  resetForm() {
    this.packageAssignForm.reset();
    this.show = false;
    // this.searchbox = ' ';
    this.formEditMode = false;
    // this.getNextRecordIdOfTable();
    // this.removeAllItemServices();
    this.resetIngredients();
    this.serviceList = [];
    this.getAllPackages();
  }
  reset() {
    this.packageAssignForm.reset();
    // this.removeAllItemServices();
    this.resetIngredients();
    this.serviceList = [];
  }
  // removeAllItemServices() {
  //   const itemIngredients = this.getItemList();
  //   for (let i = itemIngredients.controls.length - 1; i >= 0; i--) {
  //     itemIngredients.removeAt(i);
  //   }
  // }
  resetIngredients() {
    const items = this.packageAssignForm.get('openingItems') as FormArray;
    for (let i = items.controls.length - 1; i >= 0; i--) {
      items.removeAt(i);
    }
    this.serviceList = [];
  }
  onSubmit() {
    const customerAssignPackages = this.packageAssignForm.get('openingItems').value;
    if (customerAssignPackages.length !== 0) {
      this.packageAssignmentService.addPackageAssign(customerAssignPackages).subscribe(
        res => {
          if (res['status'] === 'success') {
            this.popToast('Packages Assign successfully', '');
            // this.resetopeningItems();
            this.resetForm();
            this.getAllPackageAssign(this.itemsPerPage, this.pageIndex, '');
            // this.show = false;
          }
        },
        err => {
          if (err['status'] === 'error') {
            this.popToast('Unable to Assign Packages ', '51');
          }
          console.log('error');
        }
      );
    } else {
      if (this.packageAssignForm.invalid) {
        this.packageAssignForm.get('customerId').markAsDirty();
        this.packageAssignForm.get('packageId').markAsDirty();
        this.packageAssignForm.get('validFrom').markAsDirty();
        this.packageAssignForm.get('validFrom').markAsDirty();
        this.packageAssignForm.get('validTo').markAsDirty();
        this.packageAssignForm.get('stylistId').markAsDirty();
      } else {
        this.popToast('Add in list at least one Package ', '51');
      }
    }
  }
  editAssignPackage(j: number) {
    this.formEditMode = true;
    const pkgAssign = this.getItemList().at(j).value;
    this.packages = [pkgAssign.package];
    if (typeof (pkgAssign) !== 'string') {
      //  this.searchItemSelected = item;
      this.packageAssignForm.patchValue({
        // validFrom: pkgAssign.validFrom,
        // validTo: pkgAssign.validTo,
        package: pkgAssign.package,
        packageId: pkgAssign.packageId,
        customerId: pkgAssign.customerId,
        stylistId: pkgAssign.stylistId,
        stylist: pkgAssign.stylist,
        advanceAmount: pkgAssign.advanceAmount,
        index: j
      });
      this.numberofday = parseInt(pkgAssign.package.validFor) - 1;
      this.dateFormate(pkgAssign.validFrom, pkgAssign.validTo);
    }
  }
  getitemById(id) {
    this.itemService.getItemById(id).subscribe(
      res => {
        return res;
      },
      err => {
        return err;
      }
    );
  }
  checkPackageHistory(j: number) {
    const pkgHistory = [];
    const pkgAssign = this.getItemList().at(j).value;
    if (pkgAssign['packagedetails'] !== null) {
      let i = 0;
      pkgAssign['packagedetails'].forEach(pkg => {
        pkgHistory.push(
          {
            itemobj: [
              this.getitemById(pkg.itemId)
            ],
            pkgName: pkgAssign.package.packageName,
            validfrom: pkgAssign.validFrom,
            validto: pkgAssign.validTo,
            quantity_sitting: pkgAssign.package.package_services[i].quantity,
            itemId: pkg.itemId,
            rate: pkgAssign.package.package_services[i].rate,
            totalPackageAmount: pkgAssign.package.totalCost,
            availedQuantity: pkg.availed_qty,
            balanceQuantity: pkg.balance_qty,
            pkgId: '',
          });
        i++;
      });
      // console.log(this.getitemById(pkgAssign['packagedetails'][0].itemId));
      this.packagesHistory = pkgHistory;
    }
  }

  dateFormate(bdate: string, dtJoining: string) {
    const birthdaydate = new Date(bdate);
    const jioningdate = new Date(dtJoining);
    this.packageAssignForm.patchValue({
      validFrom: {
        date: {

          year: birthdaydate.getFullYear(),
          month: birthdaydate.getMonth() + 1,
          day: birthdaydate.getDate()

        }
      },
      validTo: {
        date: {
          year: jioningdate.getFullYear(),
          month: jioningdate.getMonth() + 1,
          day: jioningdate.getDate()
        }

      },
    });
  }
  getPackageToEdit(id: number) {
    this.show = true;
    this.packageAssignForm.get('customerId').setValue(id);
    this.selectedCustomer(id);
  }
}
