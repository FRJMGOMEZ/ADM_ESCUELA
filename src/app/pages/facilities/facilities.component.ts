import { Component, OnInit, OnDestroy } from '@angular/core';
import { FacilitiesService } from '../../providers/facilities.service';
import { Facilitie } from '../../models/facilitie.model';
import { FacilitiesModalController } from '../../modals/facilities-modal/facilities-modalController';
import { SwalService } from '../../providers/swal.service';

@Component({
  selector: 'app-facilities',
  templateUrl: './facilities.component.html',
  styleUrls: ['./facilities.component.css']
})
export class FacilitiesComponent implements OnInit,OnDestroy {

  facilities:Facilitie[] = []

  from:number = 0;

  constructor(public _facilitieServices:FacilitiesService,
              public _facilitiesModalController:FacilitiesModalController,
              private _swalServices:SwalService) {
   }

  ngOnInit() {
    this._facilitieServices.getFacilities().subscribe();
  }

  putFacilitie(id:string){
    this._facilitiesModalController.showModal(id)
    this._facilitiesModalController.notification.emit()
  }

  changeStatus(facilitie:Facilitie){
    switch(facilitie.status){
      case true: facilitie.status = false; 
      break;
      case false: facilitie.status = true; 
      break;
    }
    this._facilitieServices.putFacilitie(facilitie._id,facilitie).subscribe()
  }

  changeFrom(number: number) {
    if (this.from + number >= 0) {
      this.from += number;
    }
    this._facilitieServices.facilities = [];
    this._facilitieServices.getFacilities(this.from).subscribe()
  }

  deleteFacilitie(id:string){
      this._swalServices.confirmDelete().then((res)=>{
        if(res){
          this._facilitieServices.deleteFacilitie(id).subscribe(()=>{
            this._facilitieServices.getFacilities(this.from).subscribe()
          })
        }
    })
  }
  ngOnDestroy(){
    this._facilitieServices.facilities=[]
  }
}