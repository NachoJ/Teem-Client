import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MdIconRegistry } from '@angular/material';
import { Router } from '@angular/router';

import { CoreService } from '../core/core.service';

import { environment } from '../../environments/environment';
import { TranslateService } from "@ngx-translate/core";

declare var moment: any;
declare var google: any;
declare var $: any;
declare let window;

@Component({
	selector: 'app-find-match',
	templateUrl: './find-match.component.html',
	styleUrls: ['./find-match.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class FindMatchComponent implements OnInit {

	error: string;
	success: string;
	cityName: string = "";

	sport: string = "all";
	sportOptions = [];

	latitudeMap: any;
	longitudeMap: string;

	nearByMatch: any[] = [];

	nearByMatchMarkers: any[] = [];

	PROFILE_IMAGE_PATH: string;

	map: any;
	markers = [];

	user: any;

	constructor(private coreService: CoreService, iconRegistry: MdIconRegistry, sanitizer: DomSanitizer,
		private ngZone: NgZone, private router: Router) {
		this.PROFILE_IMAGE_PATH = environment.PROFILE_IMAGE_PATH;

		this.user = JSON.parse(window.localStorage['teem_user'] || '');

		iconRegistry.addSvgIcon(
			'all',
			sanitizer.bypassSecurityTrustResourceUrl('assets/svg/all-sports_off.svg'));
		iconRegistry.addSvgIcon(
			'Soccer',
			sanitizer.bypassSecurityTrustResourceUrl('assets/svg/futbol_off.svg'));
		iconRegistry.addSvgIcon(
			'Padel',
			sanitizer.bypassSecurityTrustResourceUrl('assets/svg/padel_off.svg'));
		iconRegistry.addSvgIcon(
			'Basketball',
			sanitizer.bypassSecurityTrustResourceUrl('assets/svg/baloncesto_off.svg'));

		window["FindMatchComponent"] = this;

		this.loadSports();

		this.getAndSetLocation();

	}

	ngOnInit() {
		var self = this;
		$(document).ready(function () {
			console.log("jQuery is ready");
			self.initMap();
		});
	}

	ngAfterViewInit() {
	}

	loadSports() {
		this.coreService.getMainSports()
			.subscribe((response) => {
				console.log("get Main Sport", response);
				let allOption = {
					id: "all",
					imagurl: "all",
					title: "all"
				};
				this.sportOptions.push(allOption);
				for (let res of response) {
					this.sportOptions.push(res);
				}
			},
			(error: any) => {
				this.coreService.emitErrorMessage(error);
			});
	}

	initMap() {
		let self = this;
		if (this.latitudeMap != null && this.longitudeMap) {
			var myLatLng = {
				lat: parseFloat(this.latitudeMap),
				lng: parseFloat(this.longitudeMap)
			};
		} else {
			console.log("latitude not found");
			var myLatLng = { lat: 22.278323, lng: 70.798889 };
		}

		this.map = new google.maps.Map(document.getElementById('nearByMap'), {
			zoom: 13,
			center: myLatLng
		});

		// Create the search box and link it to the UI element.
		var input = document.getElementById('pac-input');
		var searchBox = new google.maps.places.SearchBox(input);

		searchBox.addListener('places_changed', function () {
			var places = searchBox.getPlaces();
			if (!places[0].geometry) {
				console.log("Returned place contains no geometry");
				return;
			}
			console.log("Places : ", places[0].formatted_address);
			console.log("Location: " + places[0].geometry.location.lat() + ", " + places[0].geometry.location.lng());

			self.ngZone.run(() => {
				self.cityName = places[0].formatted_address;
				self.latitudeMap = places[0].geometry.location.lat();
				self.longitudeMap = places[0].geometry.location.lng();
				self.getMatchMarkers();
			});
		});
		// map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

		// Bias the SearchBox results towards current map's viewport.
		// map.addListener('bounds_changed', function () {
		// 	searchBox.setBounds(map.getBounds());
		// });


	}

	navigateToDetails(id) {
		console.log('redirect', id);
		this.router.navigate(['/match-details/' + id]);
	}

	getAndSetLocation() {
		let self = this;
		if (navigator.geolocation) {
			console.log("navigator.geolocation found");

			navigator.geolocation.getCurrentPosition(this.setLocation.bind(this));
		} else {
			this.error = "Cannot find Geolocation";
			if (this.user.city) {
				this.cityName = this.user.city;
				this.getLatLongByCityName();
			}
		}
	}

	setLocation(position) {
		console.log("position", position);
		// console.log("latitudeMap",position.coords.latitude);
		// console.log("temp ",temp);

		this.latitudeMap = position.coords.latitude;
		this.longitudeMap = position.coords.longitude;
		this.getAddressFromLatLng();
		this.getMatchMarkers();
	}

	getAddressFromLatLng() {
		let self = this;
		this.coreService.getAddressFromLatLong(this.latitudeMap, this.longitudeMap)
			.subscribe((response) => {
				console.log("getAddressFromLatLng response: ", response);
				self.ngZone.run(() => {
					self.cityName = response;
				});
			},
			(error: any) => {
				this.coreService.emitErrorMessage(error);
			});
	}

	//--------- Method obsolated as we are getting lat,long directly from places api ----------
	//--------- Let's keep this method in case we might need in future ----------
	getLatLongByCityName() {
		console.log("cityName", this.cityName);
		let self = this;
		this.coreService.getLatLongByCityName(this.cityName)
			.subscribe((response) => {
				console.log("getLatLongByCityName response: ", response)
				self.ngZone.run(() => {
					self.latitudeMap = response.lat;
					self.longitudeMap = response.lng;
					self.getMatchMarkers();
				});
			},
			(error: any) => {
				this.coreService.emitErrorMessage(error);
			});
	}

	onSportChange() {
		this.getMatchMarkers();
	}

	getMatchMarkers() {
		let data = {
			"lat": this.latitudeMap,
			"long": this.longitudeMap,
			"maxdistance": "2000",
			"sport": this.sport
		};
		this.coreService.getNearByMatch(data)
			.subscribe((response) => {
				console.log("nearByMatch = ", response);
				this.nearByMatch = [];
				// this.nearByMatch = response;
				for (let match of response) {
					match["filteredMatchTime"] = moment(match.matchtime).format('HH:mm');
					match["filteredMatchDate"] = moment(match.matchtime).format('MMM DD, YYYY');
					this.nearByMatch.push(match);
				}
				this.nearByMatch.sort(function (a, b) {
					if (a.filteredMatchDate < b.filteredMatchDate) {
						return -1;
					}
					if (a.filteredMatchDate > b.filteredMatchDate) {

						return 1;
					}
					return 0;
				});
				let dateToCheck: string = "";
				for (let match of this.nearByMatch) {
					if (match.filteredMatchDate != dateToCheck) {
						match["displayDate"] = true;
						dateToCheck = match.filteredMatchDate;
					} else {
						match["displayDate"] = false;
					}

				}
				// console.log("moment = ", moment(match.matchtime).format('HH:mm'));
				// console.log("Matches", this.nearByMatch)
				this.setMatchMarker();
			},
			(error: any) => {
				this.coreService.emitErrorMessage(error);
				// console.log(error);
				// this.success = '';
				// this.error = error;
				// this._router.navigate(['/login']);
			});
	}

	setMatchMarker() {
		console.log("setMatchMarker ", this.nearByMatch);

		// Clear out the old markers.
		this.markers.forEach(function (marker) {
			marker.setMap(null);
		});
		this.markers = [];

		var bounds = new google.maps.LatLngBounds();
		var infowindow = [];
		for (var index = 0; index < this.nearByMatch.length; index++) {
			console.log("index = ", index);
			let match = this.nearByMatch[index];
			let sportdetail = match.sportdetail[0];
			let userdetail = match.userdetail[0];

			var goldStar = {
				url: sportdetail.imageurl,
				anchor: new google.maps.Point(25, 50),
				scaledSize: new google.maps.Size(20, 20)
				// path: image,
				// fillColor: 'yellow',
				// fillOpacity: 0.8,
				// scale: 1,
				// strokeColor: 'gold',
				// strokeWeight: 14
			};
			var price = 'free';
			if (match.price)
				price = match.price;
			var showContent = '<h4> Creator: ' + userdetail.username + '</h4>'
				+ '<h4> Game: ' + sportdetail.title + '</h4>'
				+ '<p>Price: ' + price + "</p><br>"
				+ "<button md-button onclick=FindMatchComponent.navigateToDetails('" + match._id + "');>Join Now</button>";
			// console.log("my marker id", myMarker.id);
			// console.log("content = ", showContent);

			infowindow[index] = new google.maps.InfoWindow({
				content: showContent,
				maxWidth: 200
			});

			var myLatLng = {
				lat: parseFloat(match.coordinates[1]),
				lng: parseFloat(match.coordinates[0])
			}
			this.markers[index] = new google.maps.Marker({
				icon: goldStar,
				position: myLatLng,
				map: this.map,
				title: sportdetail.title
			});
			let self = this;
			// this.markers[index].addListener('click', function () {
			// 	infowindow.setPosition(myLatLng);
			// 	console.log("info window = ", index);
			// 	infowindow.open(this.map, self.markers[index]);
			// });

			google.maps.event.addListener(this.markers[index], 'click', function (innerKey) {
				return function () {
					infowindow[innerKey].open(this.map, self.markers[innerKey]);
				}
			}(index));

			bounds.extend(this.markers[index].getPosition());
		}
		// for (let match of this.nearByMatch) {
		// 	var marker = {
		// 		id: match._id,
		// 		creator: match.userdetail[0].username,
		// 		title: match.sportdetail[0].title,
		// 		price: match.price,
		// 		myLatLng: {
		// 			lat: parseFloat(match.coordinates[1]),
		// 			lng: parseFloat(match.coordinates[0])
		// 		}
		// 	}
		// 	this.nearByMatchMarkers.push(marker);

		// }
		if (this.nearByMatch.length <= 0) {
			console.log("no place found");
			bounds.extend(new google.maps.LatLng(this.latitudeMap, this.longitudeMap));
			this.map.setZoom(13);
		}
		this.map.fitBounds(bounds);

		// console.log("MArkers", this.nearByMatchMarkers);
		// this.initMap();
	}


	checkSport(index, value: string): boolean {
		if (index == 1 && value.includes('soccer')) {
			return true;
		}
		if (index == 2 && value.includes('basketball')) {
			return true;
		}
		if (index == 3 && value.includes('paddle')) {
			return true;
		}
		return false;
	}

}
