import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../core/core.service';
import { Pitch } from '../shared/interface/pitch';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
// import 'rxjs/Rx';  // use this line if you want to be lazy, otherwise:
import 'rxjs/add/operator/do';  // debug

import { TranslateService, TranslationChangeEvent, LangChangeEvent } from '@ngx-translate/core';

@Component({
	selector: 'app-pitch',
	templateUrl: './pitch.component.html',
	styleUrls: ['./pitch.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class PitchComponent implements OnInit {

	error: string;
	success: string;

	name: string;
	covering: string;
	lights: string;
	surface: string;
	// sport: string;

	sport = [];
	mySportOptions = [
		{ value: 'option1', viewValue: 'option1' },
		{ value: 'option2', viewValue: 'option2' },
		{ value: 'option3', viewValue: 'option3' }
	];

	surfaceOptions = [
		{ value: 'synthethic turf', viewValue: 'SYNTHETHIC TURF' },
		{ value: 'natural grass', viewValue: 'NATURAL GRASS' },
		{ value: 'parquet floor', viewValue: 'PARQUET FLOOR' },
		{ value: 'rubber/pvc', viewValue: 'RUBBER/PVC' },
		{ value: 'resin', viewValue: 'RESIN' },
		{ value: 'terrain', viewValue: 'TERRAIN' },
		{ value: 'cement', viewValue: 'CEMENT' },

	];
	sportOptions = [];
	// sportOptions = [
	// 	{ value: 'option1', viewValue: 'option1' },
	// 	{ value: 'option2', viewValue: 'option2' },
	// 	{ value: 'option3', viewValue: 'option3' }
	// ];
	price: string;

	pitches: Pitch[];
	deleteData = [];

	// nameCtrl = FormControl[];

	sub: any;
	subNew: any;

	// public pitchFormGroup: FormGroup;
	public pitchFormGroupArray: FormGroup[] = [];
	isFormValid: boolean = false;

	constructor(private coreService: CoreService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private translate: TranslateService) {
		this.sub = this.route.snapshot.params.scId;
		console.log("sub", this.sub);
		this.loadSports();
		this.pitches = [];
		this.subNew = this.route.snapshot.params.new;
		// this.addMore();

		// translate.onLangChange.subscribe((event: LangChangeEvent) => {
		// 	console.log("language chnaged", event);
		// 	this.loadSports();
		// });

	}

	ngOnInit() { }

	loadSports() {
		this.sportOptions.length = 0;
		this.coreService.getAllSports()
			.subscribe((response: any) => {
				console.log("sport options response = ", response);
				for (var res of response) {
					// console.log("res = ",res);
					let langTitle = "";
					let tempsport = "";
					// this.translate.get(res.title).subscribe(
					// 	value => {
					// 		// value is our translated string
					// 		langTitle = value;
					// 	})
					if (tempsport != res.title) {
						tempsport = res.title;
						console.log("sport = ", res.title + " " + res.id);
						// this.subSportOption.push({ value: res.id, viewValue: res.title, isDisabled: true });
						this.sportOptions.push({ value: res.id, viewValue: res.title, isDisabled: true });
					}
					for (var r of res.subsport) {
						console.log("r id = " + r.title + " " + r.id)
						this.sportOptions.push({ value: r.id, viewValue: res.title, viewValue2: r.title, sportid: res.id, isDisabled: false });
						// this.subSportOption.push({ value: r.id, viewValue: res.title + " " + r.title, sportid: res.id, isDisabled: false });
					}
					// console.log("res title " + res.title + " res value " + res.value);
					// this.subSportOption.push({ value: res.id, viewValue: res.sportid.title + " " + res.title, isDisabled: false });
				}
				console.log("sport options  = ", this.sportOptions);
				//this.sportOptions = response;

				if (this.subNew) {
					this.addMore();
				} else {
					this.loadPitch();
				}
			},
			(error: any) => {
				this.error = error;
			});
	}

	formChanged() {
		setTimeout(() => {

			// console.log("pitchFormGroupArray length", this.pitchFormGroupArray.length);
			// console.log("deleteData length", this.deleteData.length);
			this.isFormValid = true;
			let index = 0;
			for (let fm of this.pitchFormGroupArray) {
				// console.log("sport = ", index + " " + this.pitches[index].sport)
				if (!fm.valid || this.pitches[index].sport.length <= 0) {
					this.isFormValid = false;
					break;
				}
				index++;
			}
		}, 100);
	}

	markDirty(index){
		console.log("index = ",index);
		this.pitches[index].isDirty = true;
	}

	addValidationControls() {
		this.pitchFormGroupArray.push(this.formBuilder.group({
			name: ['', Validators.required],
			covering: ['', [Validators.required]],
			lights: ['', [Validators.required]],
			surface: ['', [Validators.required]],
			// sports: ['', [Validators.required]],
			price: ['', [Validators.required]]
		}));
	}
	addMore() {
		console.log('add', this.pitches);
		// const control = <FormArray>this.pitchFormGroup.controls['names'];
		// control.push(this.initNames());

		this.addValidationControls();
		let tempPitch = <Pitch>{};
		tempPitch.scid = this.sub;
		tempPitch.sport = [];
		tempPitch.sport.push(this.sportOptions[0].id);
		this.pitches.push(tempPitch);
		this.formChanged();
	}

	loadPitch() {
		this.coreService.loadPitches(this.sub)
			.subscribe((response) => {
				// console.log("pitches load",response);
				for (let res of response) {
					console.log('pitch load')
					this.addValidationControls();
					let temp = res;
					temp.sport = res.sport.split(',');
					this.pitches.push(temp);
				}
				this.formChanged();
			},
			(error: any) => {
				this.coreService.emitErrorMessage(error);
				// this.success = '';
				// this.error = error;
				// this._router.navigate(['/login']);
			});
	}


	removePitch(index) {

		if (this.pitches[index].id != null)
			this.deleteData.push(this.pitches[index].id)
		this.pitches.splice(index, 1);

		this.pitchFormGroupArray.splice(index, 1);
		console.log("pitchFormGroupArray lenght", this.pitchFormGroupArray.length);
		this.formChanged();

		// this.coreService.emitSuccessMessage('Pitch Removed Successfully.');
	}

	SavePitch() {
		// let temppitches= this.pitches
		// console.log(temppitches);
		// for (let p of temppitches) {

		// 	var temp = p.sport.toString();
		// 	// delete p.sport;
		// 	// p.sport = temp;
		// 	console.log("temp1",temp);
		// }
		// console.log("tempitches = ",JSON.stringify(temppitches));
		let dataPitches = JSON.stringify(this.pitches);
		let userid = JSON.parse(window.localStorage['teem_user']).id;
		let data = {
			"userid": userid,
			"fields": this.pitches,
			"scid": this.sub,
			"deleteids": this.deleteData
		};
		console.log("data", JSON.stringify(data));
		this.coreService.savePitches(JSON.stringify(data))
			.subscribe((response) => {
				console.log("save pitch = ", response);
				// this.error = '';
				// this.success = response;
				this.coreService.emitSuccessMessage(response.message);
				this.router.navigate(['/match-create/' + this.sub + "/" + response.data.name + "/" + response.data.address]);
				// this.loadPitch();
			},
			(error: any) => {
				this.coreService.emitErrorMessage(error);
				// this.success = '';
				// this.error = error;
				// this._router.navigate(['/login']);
			});
	}

	addSportFeild(index) {

		//console.log("pitches = ", this.pitches);
		//console.log("sportOptions = ", this.sportOptions);
		//console.log("index=>",this.pitches[index].sport);
		//console.log("index=>",index);
		if (this.pitches[index].sport) {
		//	console.log("subsport=>",this.sportOptions[1].value);
			this.pitches[index].sport.push(this.sportOptions[1].value);
		//	console.log("sport found 1", this.pitches[index].sport);
		//	console.log("this.sportOptions[1].viewValue2", this.sportOptions[1].viewValue2);
		//	console.log("this.sportOptions[1].sportid value = ", this.pitches[index].sport);
		}
		// if (!this.pitches[index].sport) {
		// 	console.log("sport not found 2");
		// 	this.pitches[index].sport = [];
		// 	this.pitches[index].sport.push(this.sportOptions[1].sportid);
		// }
	}

	removeSelect(index) {

	}


}