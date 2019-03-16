import { Directive, ElementRef, HostListener, Renderer2, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms/src/model';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Appointments } from './appointment';
import * as moment from 'moment';

@Directive({
    selector: '[cp1]'
})
export class CP1Directive implements AfterViewInit {
    appointmentComponent: any;
    formData: FormGroup;
    constructor(private elRef: ElementRef, private renderer: Renderer2, private vcRef: ViewContainerRef) {

        this.appointmentComponent = this.vcRef.injector['view'].component;
        //   console.log(this.vcRef);
    }
    ngAfterViewInit(): void {
        // this.renderer.listen('td', 'click', (event) => {
        //     console.log(this.elRef.nativeElement);
        // });
    }
    @HostListener('click')
    performTask() {
        const div = this.renderer.createElement('div');
        const text = this.renderer.createText('New Appointment');
        //  this.renderer.appendChild(div, text);

        // const parent = this.elRef.nativeElement.parentNode;
        // const refChild = this.elRef.nativeElement;
        // this.renderer.insertBefore(parent, div, refChild);
        // const li = this.renderer.createElement('li');
        // const text = this.renderer.createText('Click here to add li');
        // this.renderer.parentNode.(li, text);
        //  this.renderer.appendChild(this.elRef.nativeElement, div);
    }
    bindDataToDom(appdata: Appointments[], employee = "All") {
        //  console.log(employee);
        let stylistId = 0;

        appdata.forEach(data => {
            if (employee === "All") {
                stylistId = data.stylist.id;
            }
            //    console.log(stylistId);
            const date1 = moment.utc().format('YYYY-MM-DD HH:mm:ss');
            const stillUtc = moment.utc(data.appointement_date).toDate();
            const appointement_date_to_local = moment(stillUtc).local().format('YYYY-MM-DD HH:mm:ss');
            //   console.log(data.appointement_date, data.id);

            const time = appointement_date_to_local.substr(11, appointement_date_to_local.length - 3);
            const finalCloseTime = time.replace(time.substr(3, 5), '00');
            const date = Number(data.appointement_date.substr(0, 2));


            const previousDom = this.elRef.nativeElement.querySelector('[id="app_' + data.id + '"]');
            const ID = '' + stylistId + '_' + appointement_date_to_local.toString().substring(8, 10) + '/' +
                appointement_date_to_local.toString().substring(5, 7) + '/' + appointement_date_to_local.toString().substring(0, 4) + '_'
                + finalCloseTime + '';
            const parent = this.elRef.nativeElement.querySelector('[id="' + ID + '"]');

            console.log(previousDom);
            if (previousDom != null) {
                //    console.log('in');

                this.renderer.removeChild(parent, previousDom);
                previousDom.remove();


                // this.elRef.nativeElement.querySelector('[id="app_' + data.id + '"]')
            }
            // console.log(time.replace(time.substring(3, 5), '00'));
            // //  this.elRef.nativeElement =  document.getElementById('"' + ID + '"');
            // console.log(this.elRef.nativeElement.querySelector('[id="' + ID + '"]'));
            const mainDiv = this.renderer.createElement('div');
            const div = this.renderer.createElement('div');

            const customerIcon = this.renderer.createElement('i');
            this.renderer.setAttribute(customerIcon, 'class', 'fa fa-wheelchair');
            this.renderer.setStyle(customerIcon, 'margin-left', '12px');
            this.renderer.setAttribute(customerIcon, 'aria-hidden', 'true');
            this.renderer.setAttribute(customerIcon, 'title', 'Customer');

            this.renderer.appendChild(div, customerIcon);

            const text = this.renderer.createText(' ' + data.customer.name);
            this.renderer.setStyle(customerIcon, 'color', 'lime');
            const spanElement = this.renderer.createElement('span');
            this.renderer.setStyle(spanElement, 'float', 'right');
            const ihtml = this.renderer.createElement('i');
            this.renderer.setAttribute(ihtml, 'class', data.status === 'open' ? 'fa fa-calendar-times-o fa-lg' : 'fa fa-calendar-check-o');
            this.renderer.setAttribute(ihtml, 'aria-hidden', 'true');
            this.renderer.appendChild(spanElement, ihtml);

            // create span element to edit appointment
            const spanEditElement = this.renderer.createElement('span');
            this.renderer.setStyle(spanEditElement, 'float', 'left');
            const iEdithtml = this.renderer.createElement('i');
            this.renderer.setAttribute(iEdithtml, 'class', 'fa fa-pencil');
            this.renderer.setAttribute(iEdithtml, 'aria-hidden', 'true');
            this.renderer.setAttribute(iEdithtml, 'title', 'click to edit');
            this.renderer.appendChild(spanEditElement, iEdithtml);
            //end edit

            const stylistNameElement = this.renderer.createElement('span');
            this.renderer.setStyle(stylistNameElement, 'float', 'left');
            this.renderer.setStyle(stylistNameElement, 'margin-left', '4px');
            const stylistNameText = this.renderer.createText(' ' + data.stylist.name);
            this.renderer.appendChild(stylistNameElement, stylistNameText);

            const appointmentIdHtml = this.renderer.createElement('span');
            this.renderer.setAttribute(appointmentIdHtml, 'class', 'badge');
            this.renderer.setAttribute(appointmentIdHtml, 'title', 'Appointement Number');
            const appointmentId = this.renderer.createText(data.id.toString());
            this.renderer.setStyle(appointmentIdHtml, 'float', 'left');
            this.renderer.setStyle(appointmentIdHtml, 'margin-left', '8px');
            this.renderer.setStyle(appointmentIdHtml, 'background-color', '#131212');
            this.renderer.appendChild(appointmentIdHtml, appointmentId);

            const stylistElement = this.renderer.createElement('span');
            this.renderer.setStyle(stylistElement, 'float', 'left');
            this.renderer.setStyle(stylistElement, 'margin-left', '8px');
            const istylisthtml = this.renderer.createElement('i');
            this.renderer.setAttribute(istylisthtml, 'class', 'fa fa-cut');
            this.renderer.setAttribute(istylisthtml, 'aria-hidden', 'true');
            this.renderer.setAttribute(istylisthtml, 'title', 'click to edit');
            this.renderer.appendChild(stylistElement, istylisthtml);
            //  this.renderer.setStyle(servicesHtml, 'display', 'block');

            const servicesHtml = this.renderer.createElement('span');
            this.renderer.setAttribute(servicesHtml, 'class', 'customerServices');
            this.renderer.setStyle(servicesHtml, 'display', 'block');

            for (let i = 0; i < data['services'].length; i++) {
                const serviceDiv = this.renderer.createElement('div');
                const serviceText = this.renderer.createText(data['services'][i]['service']['itemName'] +
                    ' ' + moment(this.utcToLocal(data['services'][i]['started_on'])).format('YYYY-MM-DD HH:mm:ss'));
                this.renderer.appendChild(serviceDiv, serviceText);
                this.renderer.setAttribute(servicesHtml, 'title', 'Availed Services');
                this.renderer.appendChild(servicesHtml, serviceDiv);

            }
            this.renderer.setAttribute(div, 'class', data.status === 'open' ? 'notconfirmed' : data.status);
            this.renderer.setAttribute(iEdithtml, 'id', data.id.toString());
            this.renderer.appendChild(div, spanEditElement);
            this.renderer.appendChild(div, appointmentIdHtml);
            this.renderer.appendChild(div, stylistElement);
            this.renderer.appendChild(div, stylistNameElement);
            this.renderer.setAttribute(div, 'id', data.id.toString());
            this.renderer.setAttribute(mainDiv, 'id', 'app_' + data.id.toString());
            this.renderer.appendChild(div, text);
            this.renderer.appendChild(div, spanElement);
            this.renderer.appendChild(div, servicesHtml);
            this.renderer.appendChild(mainDiv, div);
            if (parent !== null) {

                this.renderer.appendChild(parent, mainDiv);

            }


            this.renderer.listen(spanEditElement, 'click', (event) => {
                const appointmentID = event['srcElement'].id;
                console.log(appointmentID);
                this.appointmentComponent.editAppointment(appointmentID);
            });
        });
    }
    utcToLocal(date: any): Date {
        //  console.log(date);
        const date1 = moment.utc().format('YYYY-MM-DD HH:mm:ss');

        const stillUtc = moment.utc(date).toDate();
        date = moment(stillUtc).local().toDate();

        return date;
    }
    AddDom(data: any) {
        //  console.log(data);
        const time = data['appointmentTime'];
        const finalCloseTime = time.replace(time.substring(3, 5), '00');
        // const date = Number(data.appoitmentDate.date.day);
        // let month;
        // if (data.appointmentDate.date.month.toString().length === 1) {
        //     month = data.appointmentDate.date.month < 10 ? '0' + data.appointmentDate.date.month : data.appointmentDate.date.month;
        // } else {
        //     month = data.appointmentDate.date.month;
        // }
        // let day;
        // if (data.appointmentDate.date.day.toString().length === 1) {

        //     day = data.appointmentDate.date.day < 10 ? '0' + data.appointmentDate.date.day : data.appointmentDate.date.day;
        // } else {
        //     day = data.appointmentDate.date.day;
        // }

        const ID = '' + data['appointement_date'].toString().substring(8, 10) + '/' +
            data['appointement_date'].toString().substring(5, 7) + '/' + data['appointement_date'].toString().substring(0, 4) + '_'
            + finalCloseTime + '';
        console.log(ID);
        //  console.log(time.replace(time.substring(3, 5), '00'));
        //  this.elRef.nativeElement =  document.getElementById('"' + ID + '"');
        //  console.log(this.elRef.nativeElement.querySelector('[id="' + ID + '"]'));
        const div = this.renderer.createElement('div');
        const text = this.renderer.createText(data.customer);

        const spanElement = this.renderer.createElement('span');
        this.renderer.setStyle(spanElement, 'float', 'right');


        const ihtml = this.renderer.createElement('i');
        this.renderer.setAttribute(ihtml, 'class', data.status === 'open' ? 'fa fa-calendar-times-o fa-lg' : 'fa fa-calendar-check-o');
        this.renderer.setAttribute(ihtml, 'aria-hidden', 'true');

        this.renderer.appendChild(spanElement, ihtml);

        // <span class="th1" style="display: block;">
        //     Hair Cutting 00: 00 - 00: 30 < /span>

        // create span element to edit appointment
        const spanEditElement = this.renderer.createElement('span');
        this.renderer.setStyle(spanEditElement, 'float', 'left');
        const iEdithtml = this.renderer.createElement('i');
        this.renderer.setAttribute(iEdithtml, 'class', 'fa fa-pencil');
        this.renderer.setAttribute(iEdithtml, 'aria-hidden', 'true');
        this.renderer.appendChild(spanEditElement, iEdithtml);
        //end edit

        const servicesHtml = this.renderer.createElement('span');
        this.renderer.setAttribute(servicesHtml, 'class', 'th1');
        this.renderer.setStyle(servicesHtml, 'display', 'block');

        for (let i = 0; i < data['serviceList'].length; i++) {
            const serviceDiv = this.renderer.createElement('div');
            const serviceText = this.renderer.createText(data['serviceList'][i]['itemName'] + ' ' + data['serviceList'][i]['serviceTime']);
            this.renderer.appendChild(serviceDiv, serviceText);
            this.renderer.appendChild(servicesHtml, serviceDiv);
        }

        this.renderer.setAttribute(div, 'class', data.status === 'open' ? 'notconfirmed' : data.status);
        this.renderer.setAttribute(iEdithtml, 'id', data.id);
        this.renderer.appendChild(div, spanEditElement);
        this.renderer.appendChild(div, text);
        this.renderer.appendChild(div, spanElement);
        this.renderer.appendChild(div, servicesHtml);

        const tdId = this.elRef.nativeElement.querySelector('[id="' + ID + '"]');
        console.log(tdId);
        if (tdId !== null) {
            this.renderer.appendChild(this.elRef.nativeElement.querySelector('[id="' + ID + '"]'), div);
        }
        this.renderer.listen(spanEditElement, 'click', (event) => {
            const appointmentID = event['srcElement'].id;
            console.log(appointmentID);
            console.log(this.appointmentComponent);
            this.appointmentComponent.editAppointment(appointmentID);
        });
        //  this.performTask();
    }
}
