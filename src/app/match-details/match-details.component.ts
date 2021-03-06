import { Component, OnInit, ViewEncapsulation, NgZone, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../core/core.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MdDialog, MdDialogRef } from '@angular/material';
import { environment } from "../../environments/environment";

declare var moment: any;
declare var $: any;
declare var google: any;
declare var FB, window: any;
declare var io: any;

@Component({
	selector: 'app-match-details',
	templateUrl: './match-details.component.html',
	styleUrls: ['./match-details.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class MatchDetailsComponent implements OnInit, OnDestroy {

	match: any;
	sub: any;
	team1: any[] = [];
	team2: any[] = [];
	team1player: any[] = [];
	team2player: any[] = [];
	benchPlayer1: any[] = [];
	benchPlayer2: any[] = [];

	somebenchPlayer1: any[] = [];
	somebenchPlayer2: any[] = [];

	user: any;
	searchPlayer: any;
	players: any[] = [];
	selectedPlayer: any[] = [];
	PROFILE_IMAGE_PATH: string;
	matchjoin: boolean = true;
	matchleave: boolean = false;
	linkToShare: any;
	fbAppId: any;
	isMobile: boolean = false;
	sanitizedFacebookMessangerUrl: any;
	sanitizedWhatsappUrl: any;
	sanitizedTelegramUrl: any;
	sanitizedEmailUrl: any;

	clickDisabled = false;
	// socket: any;
	// isSocketConnected: boolean = false;
	chatString = "";
	chat: any[] = [];

	currencySymbol = String.fromCharCode(36);
	EURSymbol = String.fromCharCode(8364);
	USDSymbol = String.fromCharCode(36);
	GBPSymbol = String.fromCharCode(163);
	SEKSymbol = String.fromCharCode(107) + String.fromCharCode(114);
	AUDSymbol = String.fromCharCode(36);

	disableInvitation = false;
	tokenLenght = 0;

	shortUrlForTwitter: any;

	constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private coreService: CoreService, public dialog: MdDialog, private ngZone: NgZone) {

		this.PROFILE_IMAGE_PATH = environment.PROFILE_IMAGE_PATH;
		this.user = JSON.parse(window.localStorage['teem_user']);
		this.linkToShare = document.location.href;
		this.sanitizedEmailUrl = sanitizer.bypassSecurityTrustUrl('mailto:?subject=match%20detail%20share%20link&body=' + document.location.href);
		this.sanitizedFacebookMessangerUrl = sanitizer.bypassSecurityTrustUrl('fb-messenger://share/?link=' + document.location.href + '&app_id=785727668257883');
		this.sanitizedWhatsappUrl = sanitizer.bypassSecurityTrustUrl('whatsapp://send?text=' + document.location.href);
		this.sanitizedTelegramUrl = sanitizer.bypassSecurityTrustUrl('tg://msg?text=' + document.location.href);
		this.fbAppId = 785727668257883;
		this.sub = this.route.snapshot.params.matchId;
		if (this.sub) {
			var self = this;
			// this.socket = io.sails.connect();

			// this.socket.on('connect', function () {
			// 	self.ngZone.run(() => {
			// 		self.isSocketConnected = true;
			// 	});
			// });

			environment.socket.on('match', function messageReceived(message) {
				self.ngZone.run(() => {
					self.updateOnMatchModel(message);
				});
			});

			environment.socket.get(environment.BASEAPI + environment.GET_MATCH + self.sub,
				function matchReceived(response) {
					self.ngZone.run(() => {
						console.log("response match = ", response);
						self.initMatch(response.data);
					});
				});

			environment.socket.get(environment.BASEAPI + environment.GET_MATCH_CHAT + self.sub,
				function chatReceived(response) {
					self.ngZone.run(() => {
						console.log("response chat= ", response);
						if (!response.error)
							self.chat = response.data;
						setTimeout(function () {
							if ($('#main-chat-box')[0])
								$("#main-chat-box").animate({ scrollTop: $('#main-chat-box')[0].scrollHeight }, 0);
						}, 1500);
					});
				});
		}
	}

	updateOnMatchModel(message: any) {
		var self = this;
		switch (message.verb) {

			// Handle user creation
			case 'created':
				self.ngZone.run(() => {
					// self.createdUser(message)
				});
				break;

			// Handle a user changing their name
			case 'updated':
				self.ngZone.run(() => {
					// self.updatedUser(message)
				});
				break;

			// Handle user destruction
			case 'destroyed':
				self.ngZone.run(() => {
					// self.removedUser(message)
				});
				break;

			case 'messaged':
				self.ngZone.run(() => {
					console.log("messaged");
					if (message.data.type == 'jointeam') {
						environment.socket.get(environment.BASEAPI + environment.GET_TEAM_MATCH + self.sub,
							function matchReceived(response) {
								self.ngZone.run(() => {
									console.log("matchReceived", response);
									self.initGetMatch(response.data);
								});
							});
					}
					if (message.data.type == 'leaveteam') {
						environment.socket.get(environment.BASEAPI + environment.GET_TEAM_MATCH + self.sub,
							function matchReceived(response) {
								self.ngZone.run(() => {
									console.log("matchReceived", response);
									self.initGetMatch(response.data);
								});
							});
					}
					if (message.data.type == 'chatmatch') {
						console.log("chatmatch = ", message);
						self.chat.push(message.data.data);
						setTimeout(function () {
							if ($('#main-chat-box')[0])
								$("#main-chat-box").animate({ scrollTop: $('#main-chat-box')[0].scrollHeight }, 0);
						}, 200);
					}
				});
				break;

			default:
				break;
		}
	}

	initMatch(message) {
		var self = this;
		self.match = message.data[0];
		self.match["filteredDate"] = moment(message.data[0].matchtime).format('MMM DD, YYYY HH:mm');
		if (self.match.paymenttype == "free") {
			self.match['payment'] = "";
		} else {
			self.match['payment'] = this.currencyChanged(self.match.currency);
		}

		self.initMap();
		self.initTeam();
	}

	initGetMatch(response) {
		this.match = [];
		this.team1 = [];
		this.team2 = [];
		this.team1player = [];
		this.team2player = [];
		this.benchPlayer1 = [];
		this.benchPlayer2 = [];
		this.matchjoin = true;
		this.matchleave = false;
		this.match = response[0];
		this.match["filteredDate"] = moment(response[0].matchtime).format('MMM DD, YYYY');
		this.initTeam();
	}
	initMap() {
		let self = this;
		var markers = [];
		if (self.match.coordinates[0] != null && self.match.coordinates[1]) {
			var myLatLng = {
				lat: parseFloat(self.match.coordinates[1]),
				lng: parseFloat(self.match.coordinates[0])
			};
		} else {
			console.log("latitude not found");
			var myLatLng = { lat: 22.278323, lng: 70.798889 };
		}

		var map = new google.maps.Map(document.getElementById('nearByMap'), {
			zoom: 13,
			center: myLatLng
		});

		var marker = new google.maps.Marker({
			position: myLatLng,
			map: map,
			title: self.match.sport.title
		});
	}

	initTeam() {
		var sportplayer = this.match.subsportid['value'];

		if (this.match.benchplayers != 0) {
			var benchplayerCount = this.match.benchplayers / 2;
			var bplyer1 = Math.ceil(benchplayerCount);
			var bplyer2 = Math.floor(benchplayerCount);
		}

		if (this.match.team) {
			this.team1 = this.match.team['teamid1'];
			this.team2 = this.match.team['teamid2'];
			//sorting array for assigned player first
			this.team1.sort(function (a, b) {
				return (a.isbenchplayer === b.isbenchplayer) ? 0 : a.isbenchplayer ? 1 : -1;
			});
			this.team2.sort(function (a, b) {
				return (a.isbenchplayer === b.isbenchplayer) ? 0 : a.isbenchplayer ? 1 : -1;
			});

			//assigning value to array team1 and team2
			for (var i = 0; i < sportplayer; i++) {

				if (this.team1[i] && this.team1[i].isbenchplayer == false) {
					var profileImg;

					if (this.team1[i].userid['id'] == this.user.id) {
						this.matchjoin = false;
						this.matchleave = true;
					}

					if (this.team1[i].userid['profileimage'] != "")
						profileImg = environment.PROFILE_IMAGE_PATH + this.team1[i].userid['profileimage'];
					else
						profileImg = "assets/img/sidebar_photo.png";

					this.team1player.push({ id: this.team1[i].userid['id'], profileimg: profileImg });
				} else {
					this.team1player.push({
						id: "",
						profileimg: "assets/img/avatar.jpg",
						userid: this.user['id'],
						matchid: this.match.id,
						teamid: 1,
						isbenchplayer: false
					});
				}
				if (this.team2[i] && this.team2[i].isbenchplayer == false) {
					var profileImg;
					if (this.team2[i].userid['id'] == this.user.id) {
						this.matchjoin = false;
						this.matchleave = true;
					}

					if (this.team2[i].userid['profileimage'] != "")
						profileImg = environment.PROFILE_IMAGE_PATH + this.team2[i].userid['profileimage'];
					else
						profileImg = "assets/img/sidebar_photo.png";

					this.team2player.push({ id: this.team2[i].userid['id'], profileimg: profileImg });
				} else {
					this.team2player.push({
						id: "",
						profileimg: "assets/img/avatar.jpg",
						userid: this.user['id'],
						matchid: this.match.id,
						teamid: 2,
						isbenchplayer: false
					});
				}
			}

		} else {
			// empty team players
			for (var i = 0; i < sportplayer; i++) {
				this.team1player.push({
					id: "",
					profileimg: "assets/img/avatar.jpg",
					userid: this.user['id'],
					matchid: this.match.id,
					teamid: 1,
					isbenchplayer: false
				});

				this.team2player.push({
					id: "",
					profileimg: "assets/img/avatar.jpg",
					userid: this.user['id'],
					matchid: this.match.id,
					teamid: 2,
					isbenchplayer: false
				});
			}
		}

		//separate bench player array
		this.somebenchPlayer1 = [];
		this.somebenchPlayer2 = [];
		this.benchPlayer1 = [];
		this.benchPlayer2 = [];
		for (let i = 0; i < this.team1.length; i++) {
			if (this.team1[i].isbenchplayer == true) {
				this.somebenchPlayer1.push(this.team1[i]);
			}
		}
		for (let i = 0; i < this.team2.length; i++) {
			if (this.team2[i].isbenchplayer == true) {
				this.somebenchPlayer2.push(this.team2[i]);
			}
		}

		//assigning value to bench player array
		for (let i = 0; i < bplyer1; i++) {
			if (this.somebenchPlayer1[i]) {
				if (this.somebenchPlayer1[i].userid.profileimage != "")
					profileImg = environment.PROFILE_IMAGE_PATH + this.somebenchPlayer1[i].userid.profileimage;
				else
					profileImg = "assets/img/sidebar_photo.png";
				if (this.somebenchPlayer1[i].userid.id == this.user.id) {
					this.matchjoin = false;
					this.matchleave = true;
				}
				this.benchPlayer1.push({ id: this.somebenchPlayer1[i].userid.id, profileimg: profileImg, });
			} else {
				this.benchPlayer1.push({
					id: "",
					profileimg: "assets/img/avatar.jpg",
					userid: this.user.id,
					matchid: this.match.id,
					teamid: 1,
					isbenchplayer: true
				});
			}
		}
		for (let i = 0; i < bplyer2; i++) {
			if (this.somebenchPlayer2[i]) {
				if (this.somebenchPlayer2[i].userid.profileimage != "")
					profileImg = environment.PROFILE_IMAGE_PATH + this.somebenchPlayer2[i].userid.profileimage;
				else
					profileImg = "assets/img/sidebar_photo.png";
				if (this.somebenchPlayer2[i].userid.id == this.user.id) {
					this.matchjoin = false;
					this.matchleave = true;
				}

				this.benchPlayer2.push({ id: this.somebenchPlayer2[i].userid.id, profileimg: profileImg });
			} else {
				this.benchPlayer2.push({
					id: "",
					profileimg: "assets/img/avatar.jpg",
					userid: this.user.id,
					matchid: this.match.id,
					teamid: 2,
					isbenchplayer: true
				});
			}
		}

		//diabling click
		let clickDisabled = false;
		for (let player of this.team1player) {
			if (player.id == this.user.id) {
				clickDisabled = true;
			}
			player.clickDisabled = clickDisabled;
		}
		let clickDisabled2 = false;
		for (let player of this.team2player) {
			if (player.id == this.user.id) {
				clickDisabled2 = true;
			}
			player.clickDisabled = clickDisabled2;
		}

		// disabling join leave when team is full
		// console.log("this.team1.length = ", this.team1.length);
		// console.log("this.team2.length = ", this.team2.length);
		// console.log("this.match.subsportid.value + this.match.benchplayers = ", this.match.subsportid.value + Math.ceil(this.match.benchplayers/2));
		if (this.team1.length == this.match.subsportid.value + Math.ceil(this.match.benchplayers / 2) && this.team2.length == this.match.subsportid.value + Math.floor(this.match.benchplayers / 2)) {
			// console.log("match full");
			this.matchjoin = false;
		}

		// Disabling match join and leave for older match
		// console.log("is oldmatch = ", moment().isAfter(moment(this.match.matchtime).substract(3, 'h')));
		// console.log("is oldmatch logic 2 = ", moment().add(3, 'h').isAfter(moment(this.match.matchtime)));
		if (moment().isAfter(moment(this.match.matchtime).subtract(3, 'h'))) {
			console.log("Old match Found");
			this.matchjoin = false;
			this.matchleave = false;
			this.disableInvitation = true;
		}

		// console.log("teamplayer 1 = ", this.team1player);
		// console.log("team 1 = ", this.team1);
		// console.log("team bench 1 = ", this.benchPlayer1);
		// console.log("teamplayer 2 = ", this.team2player);
		// console.log("team 2 = ", this.team2);
		// console.log("team bench 2 = ", this.benchPlayer2);
	}

	ngOnInit() {
		window.fbAsyncInit = function () {
			FB.init({
				appId: environment.FACEBOOK_API_KEY,
				//appId: '1762042520748053',
				//appId:'1089718477787001',
				cookie: true,
				xfbml: true,
				version: 'v2.8'
			});
		};

		// (function (d, s, id) {
		// 	var js, fjs = d.getElementsByTagName(s)[0];
		// 	if (d.getElementById(id)) { return; }
		// 	js = d.createElement(s); js.id = id;
		// 	js.src = "//connect.facebook.net/en_US/sdk.js";
		// 	fjs.parentNode.insertBefore(js, fjs);
		// }(document, 'script', 'facebook-jssdk'));

		if (navigator.userAgent.match(/Android/i)
			|| navigator.userAgent.match(/webOS/i)
			|| navigator.userAgent.match(/iPhone/i)
			|| navigator.userAgent.match(/iPad/i)
			|| navigator.userAgent.match(/iPod/i)
			|| navigator.userAgent.match(/BlackBerry/i)
			|| navigator.userAgent.match(/Windows Phone/i)
		) {
			this.isMobile = true;
		}

		let id = JSON.parse(window.localStorage['teem_user']).id;
		var self = this;
		$(document).ready(function () {
			$('.tokenize-demo').tokenize2({
				dropdownMaxItems: 5,
				searchHighlight: false,
				dataSource: function (term, object) {
					// console.log("Object = ", object);
					self.coreService.getInvitationSearchPlayer(term)
						.subscribe((response) => {
							var $items = [];
							// $.each(response.data, function (k, v) {
							for (let v of response) {
								// console.log(k + " = ", v)
								// console.log("v = ", v.email);
								var imgpath = environment.PROFILE_IMAGE_PATH + v.profileimage;
								$items.push({
									value: v.id,
									text: "<div class='parent-invite'><img class='avatar' src=" + imgpath + " onError=this.onerror=null;this.src='assets/img/sidebar_photo.png';>" + "<span class='username'>" + v.username + "</span></div>"
								});
							};
							object.trigger('tokenize:dropdown:fill', [$items]);
						},
						(error: any) => {
							this.coreService.emitErrorMessage(error);
						});
				}
			});
			$('.tokenize-demo').on('tokenize:tokens:add', function (e, value) {
				self.ngZone.run(() => {
					self.tokenLenght = $('.tokenize-demo').data('tokenize2').toArray().length;
				});
			});
			$('.tokenize-demo').on('tokenize:tokens:remove', function (e, value) {
				self.ngZone.run(() => {
					self.tokenLenght = $('.tokenize-demo').data('tokenize2').toArray().length;
				});
			});
		});
	}

	loadAutoComplete() {
		if (this.searchPlayer.length == 0) {
			this.players.length = 0;
			return 0;
		}
		if (this.searchPlayer.length >= 2) {
			this.coreService.getInvitationSearchPlayer(this.searchPlayer)
				.subscribe((response) => {
					console.log(response);
					this.players = response;
				},
				(error: any) => {
					this.coreService.emitErrorMessage(error);
				});
		}

		// this.fillAutoComplete();
	}

	// fillAutoComplete() {
	// 	console.log("fill autocomplete")
	// 	var self = this;
	// 	self.ngZone.run(() => {
	// 		$('.tokenize-demo').tokenize2().trigger('tokenize:remap');
	// 	});
	// }

	displayFn(player): string {
		return player ? player.firstname : "";
	}

	itemSelected() {
		if (this.searchPlayer.id) {
			// console.log("player = ", this.searchPlayer);
			let insertInSelectedPlayer = true;
			for (let p of this.selectedPlayer) {
				if (p.id == this.searchPlayer.id) {
					insertInSelectedPlayer = false;
					break;
				}
			}
			if (insertInSelectedPlayer) {
				this.selectedPlayer.push(this.searchPlayer);
			}
			this.searchPlayer = "";
			this.players.length = 0;
		}
	}

	removeInvites(index) {
		this.selectedPlayer.splice(index, 1);
	}

	promptForSendInvitation() {

		let dialogRef = this.dialog.open(InvitationDialogResult);
		dialogRef.afterClosed().subscribe(result => {
			if (result == "send") {
				this.sendInvitations();
			}
		});

	}

	sendInvitations() {
		let userIds = [];
		// for (let p of this.selectedPlayer) {
		// 	userIds.push(p.id);
		// }
		var self = this;
		self.ngZone.run(() => {
			userIds = $('.tokenize-demo').data('tokenize2').toArray();
		});
		let user = JSON.parse(window.localStorage['teem_user']);
		let data = {
			userid: userIds.toString(),
			matchid: this.sub,
			inviterid: user.id
		};
		console.log("invitation data = ", data);
		this.coreService.sendInvitations(JSON.stringify(data))
			.subscribe((response) => {
				this.coreService.emitSuccessMessage(response);
				// this.selectedPlayer = [];
				self.ngZone.run(() => {
					$('.tokenize-demo').tokenize2().trigger('tokenize:clear');
				});
			},
			(error: any) => {
				this.coreService.emitErrorMessage(error);
			});
	}

	joinMatch(team: any) {

		console.log("teem1 = ", this.team1);
		console.log("teem2 = ", this.team2);
		console.log("team = ", team);
		console.log("match = ", this.match);

		// if (team.teamid == 1 && this.team1.length < this.match.subsportid.value){
		// 	console.log("join teem player team 1");
		// 	team.isbenchplayer = false;
		// }
		// if (team.teamid == 2 && this.team2.length < this.match.subsportid.value){
		// 	console.log("join teem player team 2");
		// 	team.isbenchplayer = false;
		// }

		var self = this;
		// returning when user found on same team
		if (team.teamid == 1)
			var obj = this.team1.filter(function (obj) {
				// console.log("obj = ",obj);
				return (obj.userid.id === self.user.id && team.isbenchplayer == true);
			})[0];
		if (team.teamid == 2)
			var obj2 = this.team2.filter(function (obj) {
				// console.log("obj = ",obj);
				return obj.userid.id === self.user.id && team.isbenchplayer == true;
			})[0];
		if (obj) {
			console.log("user found team1");
			return 0;
		}
		if (obj2) {
			console.log("user found team2");
			return 0;
		}

		// assigning bench player to false when team is not full
		if (team.isbenchplayer == true) {
			if (this.team1.length < this.match.subsportid.value) {
				team.isbenchplayer = false;
				team.teamid = 1;
				console.log("join teem player team 1");
			} else if (this.team2.length < this.match.subsportid.value) {
				team.isbenchplayer = false;
				team.teamid = 2;
				console.log("join teem player team 2");
			}
		}

		// delete team.id;
		// delete team.profileimg;
		// delete team.clickDisabled;
		var tempuser = team;
		delete tempuser.id;
		delete tempuser.profileimg;
		delete tempuser.clickDisabled;
		console.log("team = ", tempuser);
		environment.socket.post(environment.BASEAPI + environment.JOIN_MATCH, tempuser,
			function joinReceived(response) {
				self.ngZone.run(() => {
					// if(response.message == 'You are join the match')
					console.log("response joinReceived= ", response);
				});
			});
	}

	joinMatchDefault() {
		var self = this;
		let user = JSON.parse(window.localStorage['teem_user']);
		let data = {
			matchid: this.match.id,
			teamid: 1,
			userid: user.id,
			isbenchplayer: false
		};
		let team1Lenght = 0;
		let team2Lenght = 0;
		for (let player of this.team1) {
			if (!player.isbenchplayer)
				team1Lenght++;
		}
		for (let player of this.team2) {
			if (!player.isbenchplayer)
				team2Lenght++;
		}
		let bplayer1Insert = false;
		let bplayer2Insert = false;
		for (let player of this.benchPlayer1) {
			if (player.id == '') {
				bplayer1Insert = true;
				break;
			}
		}
		for (let player of this.benchPlayer2) {
			if (player.id == '') {
				bplayer2Insert = true;
				break;
			}
		}

		if (team1Lenght < this.match.subsportid['value']) {
			environment.socket.post(environment.BASEAPI + environment.JOIN_MATCH, data,
				function joinReceived(response) {
					self.ngZone.run(() => {
						console.log("response join button Received team1 = ", response);
					});
				});
			this.matchjoin = false;
			this.matchleave = true;

			return 0;
		}
		if (team2Lenght < this.match.subsportid['value']) {
			data.teamid = 2;
			environment.socket.post(environment.BASEAPI + environment.JOIN_MATCH, data,
				function joinReceived(response) {
					self.ngZone.run(() => {
						console.log("response join button Received team2 = ", response);
					});
				});
			this.matchjoin = false;
			this.matchleave = true;

			return 0;
		}

		if (bplayer1Insert) {
			data.isbenchplayer = true;
			environment.socket.post(environment.BASEAPI + environment.JOIN_MATCH, data,
				function joinReceived(response) {
					self.ngZone.run(() => {
						console.log("response join button Received bt1 = ", response);
					});
				});
			this.matchjoin = false;
			this.matchleave = true;

			return 0;
		}

		if (bplayer2Insert) {
			data.teamid = 2;
			data.isbenchplayer = true;
			environment.socket.post(environment.BASEAPI + environment.JOIN_MATCH, data,
				function joinReceived(response) {
					self.ngZone.run(() => {
						console.log("response join button Received bt2 = ", response);
					});
				});
			this.matchjoin = false;
			this.matchleave = true;

			return 0;
		}

	}

	leaveMatch() {
		var self = this;
		environment.socket.delete(environment.BASEAPI + environment.DELETE_MATCH + self.user.id + '/' + self.sub,
			function usersReceived(response) {
				console.log("delete = ", response);
			});
	}

	socialShare(share: any) {
		let self = this;
		let width = 550;
		let height = 450;
		let left = 100;
		let top = 100;
		let sharedurl = window.location.href;
		let url;
		let desc = 'Sport: ' + self.match.sport.title + ',Date: ' + self.match.filteredDate + ",Location: " + self.match.scid.address;
		if (share == "facebook") {
			FB.ui(
				{
					method: 'share',
					name: 'Teemweb',
					link: sharedurl,
					title: 'Teemweb match sharing',
					description: desc,
					caption: "teemweb",
					href: sharedurl,
				}, function (response) {
				});
		} else {
			if (share == "twitter") {
				url = 'https://twitter.com/share?text=' + desc + '&url=' + encodeURIComponent(sharedurl);
			}

			window.open(url, '', 'left=' + left + ' , top=' + top + ', width=' + width + ', height=' + height + ', personalbar=0, toolbar=0, scrollbars=1, resizable=1');
		}

	}

	ngOnDestroy() {
		console.log("ngOnDestroy");
		var self = this;
		environment.socket.get(environment.BASEAPI + environment.UNSUBCRIBE_MATCH + self.sub,
			function usersReceived(response) {
				self.ngZone.run(() => {
					console.log("unsunscribe = ", response);
				});
			});
	}

	sendMessage() {
		var self = this;
		var data = {
			matchid: self.sub,
			fromuserid: self.user.id,
			message: self.chatString
		};
		environment.socket.post(environment.BASEAPI + environment.SEND_CHAT_MESSAGE, data,
			function chatReceived(response) {
				self.ngZone.run(() => {
					console.log("response chat= ", response);
					self.chatString = "";
				});
			});

	}

	currencyChanged(currency) {
		if (currency == "eur")
			return this.EURSymbol;
		else if (currency == "usd")
			return this.USDSymbol;
		else if (currency == "gbp")
			return this.GBPSymbol;
		else if (currency == "sek")
			return this.SEKSymbol;
		else if (currency == "aud")
			return this.AUDSymbol;
		else
			return this.AUDSymbol;

	}

	loadShortURL() {
		this.coreService.shortUrl("http://www.teem.com/1231321313")
			.subscribe((response) => {
				console.log("Short Url Data = ", response);
				this.shortUrlForTwitter = response.id;
			},
			(error: any) => {
				this.coreService.emitErrorMessage(error);
			});
	}
}


@Component({
	selector: 'invitation-prompt',
	template: `<h6 md-dialog-title>Do you want to send the invitation?</h6>
				<div md-dialog-actions>
				<button md-button (click)="dialogRef.close('send')">Send</button>
				<button md-button (click)="dialogRef.close('close')">Cancel</button>
				</div>`,
})
export class InvitationDialogResult {
	constructor(public dialogRef: MdDialogRef<InvitationDialogResult>) { }
}