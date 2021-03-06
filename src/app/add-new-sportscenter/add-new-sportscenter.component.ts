import { Component, ElementRef, OnInit, NgZone, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CoreService } from '../core/core.service';

declare var google: any;
declare var $: any;

@Component({
	selector: 'te-add-new-sportscenter',
	templateUrl: './add-new-sportscenter.component.html',
	styleUrls: ['./add-new-sportscenter.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AddNewSportscenterComponent implements OnInit {

	map: any;
	address: string;
	name: string;
	phone: string;
	description: string;

	lat: string;
	long: string;

	success: string;
	error: string;

	public sportsCenterFormGroup: FormGroup;

	sub: any;

	@ViewChild('myaddress')
	el: ElementRef;

	constructor(private coreService: CoreService, private formBuilder: FormBuilder,
		private route: ActivatedRoute, private zone: NgZone, private router: Router) {

		this.sub = this.route.snapshot.params.updateId;
		if (this.sub) {

			console.log(this.sub);
			if (this.sub) {
				this.coreService.getSportsCenter(this.sub)
					.subscribe((response) => {
						// console.log(response)
						this.name = response.data[0].name;
						this.address = response.data[0].address;
						this.phone = response.data[0].phone;
						this.description = response.data[0].description;
						this.lat = response.data[0].lat;
						this.long = response.data[0].long;
						this.initAutocomplete();
					},
					(error: any) => {
						// this.error = error;

					});
			}
		}

		navigator.geolocation.getCurrentPosition(this.showPosition);

		this.sportsCenterFormGroup = this.formBuilder.group({
			address: ['', [Validators.required]],
			name: ['', [Validators.required]],
			phone: ['', [Validators.required, Validators.pattern('^(0|[1-9][0-9]*)$')]],
			description: ['', [Validators.required]]
			/*email: ['', [Validators.required, Validators.pattern('[a-zA-Z\-0-9.]+@[a-zA-Z\-0-9]+.[a-zA-Z]{2,}')]],
			payment_address: ['', Validators.required],
			address: ['', Validators.required]*/
		});
	}
	showPosition(position) {
		this.lat = position.coords.latitude;
		this.long = position.coords.longitude;
		console.log('lat = ' + position.coords.latitude);
		console.log('long = ' + position.coords.longitude);
	}

	ngOnInit() {
		let self = this;
		$(document).ready(function () {
			console.log("jQuery is ready");
			// self.initMap();
			if(!self.sub)
			self.initAutocomplete();
		});
	}

	addSportsCenter() {
		// console.log("address",this.el.nativeElement.value);
		let user = JSON.parse(window.localStorage['teem_user']);
		let data = {
			name: this.name,
			address: this.el.nativeElement.value,
			phone: this.phone,
			description: this.description,
			lat: this.lat,
			long: this.long,
			userid: user.id
			// description: ''
		};
		this.coreService.addNewSportsCenter(data)
			.subscribe((response) => {
				console.log(response.data)
				// this.error='';
				// this.success = response;
				this.coreService.emitSuccessMessage(response.message);
				this.sportsCenterFormGroup.reset();
				this.router.navigate(['/pitch/' + response.data.id + "/new"]);
			},
			(error: any) => {
				this.coreService.emitErrorMessage(error);
				// console.log(error);
				// this.success='';
				// this.error = error;
				// this._router.navigate(['/login']);
			});
	}

	updateSportsCenter() {
		console.log("update record");

		let data = {
			id: this.sub,
			name: this.name,
			address: this.el.nativeElement.value,
			phone: this.phone,
			description: this.description,
			lat: this.lat,
			long: this.long
			// description: ''
		};
		console.log("data", data);
		this.coreService.updateSportsCenter(data)
			.subscribe((response) => {
				this.coreService.emitSuccessMessage(response);
				this.router.navigate(['/my-sportscenter']);
				// console.log(response)
				// this.error='';
				// this.success = response;
			},
			(error: any) => {
				this.coreService.emitErrorMessage(error);
				// console.log(error);
				// this.success='';
				// this.error = error;
				// this._router.navigate(['/login']);
			});
	}


	initAutocomplete() {
		var self = this;
		var initlat = 40.415363;
		var initlng = -3.707398;

		// setting marker coordinate to display on map when record update
		if (self.lat && self.long && self.sub) {
			initlat = parseFloat(self.lat);
			initlng = parseFloat(self.long);
		}
		// setting map from here for update record manually
		var map = new google.maps.Map(document.getElementById('map'), {
			center: { lat: initlat, lng: initlng },
			zoom: 16,
			mapTypeId: 'roadmap'
		});
		var myMarker = new google.maps.Marker({
			position: { lat: initlat, lng: initlng },
			draggable: true,
			animation: google.maps.Animation.DROP,
			map: map
		});

		// Create the search box and link it to the UI element.
		var input = document.getElementById('pac-input');
		var searchBox = new google.maps.places.SearchBox(input);
		// map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

		// Bias the SearchBox results towards current map's viewport.
		// map.addListener('bounds_changed', function () {
		// searchBox.setBounds(map.getBounds());
		// });

		// default marker array
		var markers = [];
		// pushing value for update sportcenter
		markers.push(myMarker);
		google.maps.event.addListener(markers[0], 'dragend', function () {
					console.log("marker dragend", markers[0]);
					// console.log(this.getPosition().lat(), this.getPosition().lng());
					map.setCenter(this.getPosition()); // Set map center to marker position
					self.lat = this.getPosition().lat();
					self.long = this.getPosition().lng();
				});
		// Listen for the event fired when the user selects a prediction and retrieve
		// more details for that place.
		searchBox.addListener('places_changed', function () {
			console.log("places_changed called");
			var places = searchBox.getPlaces();

			if (places.length == 0) {
				return;
			}

			// Clear out the old markers.
			markers.forEach(function (marker) {
				marker.setMap(null);
			});
			markers = [];

			// For each place, get the icon, name and location.
			var bounds = new google.maps.LatLngBounds();
			places.forEach(function (place) {
				if (!place.geometry) {
					console.log("Returned place contains no geometry");
					return;
				}
				// var icon = {
				// 	url: place.icon,
				// 	size: new google.maps.Size(71, 71),
				// 	origin: new google.maps.Point(0, 0),
				// 	anchor: new google.maps.Point(17, 34),
				// 	scaledSize: new google.maps.Size(25, 25)
				// };

				// Create a marker for each place.
				markers.push(new google.maps.Marker({
					map: map,
					// icon: icon,
					title: place.name,
					draggable: true,
					animation: google.maps.Animation.DROP,
					position: place.geometry.location
				}));
				google.maps.event.addListener(markers[0], 'dragend', function () {
					console.log("marker dragend", markers[0]);
					// console.log(this.getPosition().lat(), this.getPosition().lng());
					map.setCenter(this.getPosition()); // Set map center to marker position
					self.lat = this.getPosition().lat();
					self.long = this.getPosition().lng();
				});

				// google.maps.event.addListener(map, 'dragend', function () {
				// 	console.log("map dragend");
				// 	markers[0].setPosition(this.getCenter()); // set marker position to map center
				// });

				var location = place.geometry.location;
				var lat = location.lat();
				var long = location.lng();
				// console.log("lat & lon = ",lat +"-"+long);
				self.lat = lat;
				self.long = long;
				console.log("lat&long called");

				if (place.geometry.viewport) {
					// Only geocodes have viewport.
					bounds.union(place.geometry.viewport);
				} else {
					bounds.extend(place.geometry.location);
				}
			});
			map.fitBounds(bounds);
		});
		google.maps.event.addDomListener(input, 'keydown', function (e) {
			if (e.keyCode == 13) {
				e.preventDefault();
				console.log("prevented default");
			}
		});
	}
}
