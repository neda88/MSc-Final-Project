<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no">
	<title>Interactive web map for managing the CSULB trees dataset developed by Neda Peiravian</title>
	<style>
	html,	body,	#viewDiv {
		padding: 0;
		margin: 0;
		height: 100%;
		width: 100%;
	}
	#title {
		visibility:hidden; 
		font-family: Times New Roman; 
		margin-left:auto; 
		margin-right:auto; 
		position:absolute; 
		top: 110px; right: 16px; 
		padding: 30px; 
		z-index:10; 
		width:250px; 
		height:350px; 
		box-sizing: border-box;  
		background-color:#fcfcfc; 
		-webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3); 
		box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3); 
		text-align:center; 
		float:center;
	}


	#trtop{
	display: block;
	position:absolute;
	width:100%;
	  top: 10px;
	  height:10%;
	  float:center;
	  
	}
  #transbox {
	<!-- margin-left: 60px; -->
	margin-right: 15px;
		position:relative; 
    background-color: #ffffff;
    opacity: 0.6;
    filter: alpha(opacity=60);
	z-index: 9;
		float:right;
	display: block;	
	text-align:center;
	max-width:75%;
	height: auto;
	border-radius: 12px;
	border: 1px solid black;
	
    }

  div.transbox h3 {
    font-weight: bold;
    color: #000000;
	margin: 5px;
           }
	
	a:link {
		color: green;
	}
	a:hover {
		color: coral;
		background-color: transparent;
		text-decoration: underline;
	}
	tr:link {
		color: green;
	}
	tr:hover {
		color: coral;
		background-color: transparent;
		text-decoration: underline;
	}
	td, th {
		border: 1px solid #dddddd;
		text-align: left;
		padding: 3px;
	}
	tr:nth-child(even) {
		background-color: #dddddd;
	}
  </style>
  <link rel="stylesheet" href="https://js.arcgis.com/4.3/esri/css/main.css">
  <link rel="stylesheet" href="https://js.arcgis.com/4.3/esri/themes/light/main.css">
  <script src="https://js.arcgis.com/4.3/"></script>
</head>
<body>
<div id="trtop">
 <div class="transbox" id="transbox">
    <h3>Interactive Web Map for Managing The CSULB Tree Dataset</h3>
  </div>
  </div>
<div id="title"></div>


<div id="viewDiv"> </div>
<script>
var searchResults,
	map,
	initialExtent,
	view,
	treeRenderer,
	graphic,
	campus,
	tree,
	search,
	editFeature,
	oid;

require([
	"dojo/dom-construct",
	"esri/Map",
	"esri/views/MapView",
	"esri/geometry/Extent",
	"esri/widgets/Compass",
	"esri/renderers/SimpleRenderer",
	"esri/symbols/PictureMarkerSymbol",
	"esri/layers/FeatureLayer",
	"esri/Graphic",
	"esri/geometry/Point",
	"esri/tasks/QueryTask",
	"esri/tasks/support/Query",
	"esri/widgets/Search",
	"esri/widgets/Legend",
	"esri/widgets/Expand",
	"esri/widgets/ScaleBar",
	"esri/widgets/Home",
	"dojo/_base/array",
	"dojo/dom",
	"dojo/on",
	"dojo/domReady!"
], function(domConstruct, Map, MapView,
	Extent,Compass, SimpleRenderer,
	PictureMarkerSymbol,
	FeatureLayer, Graphic, Point, QueryTask, Query, Search,
	Legend, Expand, ScaleBar, Home,  arrayUtils, dom, on ) {


       var logo = domConstruct.create("img", {
        src: "http://web.csulb.edu/~vbarakez/csulb-logo.jpg",
        id: "logo",
        title: "logo"
      });



	map = new Map({
		basemap: "gray"
	});
	
	initialExtent = new Extent({
		xmin: -118.13,
		xmax: -118.1,
		ymin: 33.77,
		ymax: 33.79
		//spatialReference: 102100
	});
	
	view = new MapView({
		container: "viewDiv",
		map: map,
		zoom: 15,
		center: [-118.114090, 33.783823],
		extent: initialExtent
	});

	treeRenderer = new SimpleRenderer({
		symbol: new PictureMarkerSymbol({
			url: "http://www.clker.com/cliparts/e/d/8/f/1206581914343605633nicubunu_RPG_map_symbols_tree_8.svg.hi.png",
			width: 5,
			height: 5,
			angle: 0
		})
	});

	graphic = new Graphic({
		getAttribute: ["*"]
	});

	campus = new FeatureLayer({
		url: "https://services3.arcgis.com/vq5vGR4r1YX7ueLg/arcgis/rest/services/Campus/FeatureServer/1?"
	});
	map.add(campus);

	tree = new FeatureLayer({
		url: "https://services3.arcgis.com/vq5vGR4r1YX7ueLg/arcgis/rest/services/Campus/FeatureServer/0?",
		outFields: ["*"],
		renderer: treeRenderer,
	
		capabiltities: {'supportsEditing': true, 'supportsUpdate': true, 'supportsQuery': true}
	});
 
	map.add(tree);

	search = new Search({
		view: view,
		sources: [{
			autoselect: false,
			popupOpenOnSelect: false,
			featureLayer: tree,
			searchFields: ["objectid", "common_name"],
			displayField: "objectid",
			exactMatch: false,
			outFields: ["*"],
			name: "Tree FS",
			placeholder: "Object ID or Tree Name",
			maxResults: 6,
			maxSuggestions: 6,
			minSuggestCharacters: 1,
			results: searchResults
		}]
	});
	view.ui.add(search, "top-right");
        view.ui.add(logo, "bottom-right");

 
	search.viewModel.on("search-complete", function(event) {
		searchResults = event.results[0].results;
		searchResults.forEach(function(sr) {
			console.log(sr.feature.attributes);
		});

		document.getElementById('title').style.visibility = "visible";
		pagenum = searchResults.length/ 20 ;
		if(!Number.isInteger(pagenum)){
			pagenum++;
		}
		pagehtml = "";
		for (x = 1; x <= pagenum; x++) {
			pagehtml += "<a id='page" + x +"' href='#' style='margin-right:5px;  border: 1px solid #ddd; float: center; padding: 3px 8px; text-decoration: none; transition: background-color .3s;  ' onClick='gotoresultspage(this.innerHTML)'>" + x + "</a>";
		}
		pagehtml += "<div id='resultstable'></div>";
		document.getElementById('title').innerHTML = pagehtml;
		gotopage = 1;
		gotoresultspage(gotopage);
	});

	search.viewModel.on("search-clear", function(event) {
		document.getElementById('title').style.visibility = "hidden";
	});

	var compassWidget = new Compass({
		view: view
	});
	view.ui.add(compassWidget, "top-left");

	var legend = new Legend({
		view: view,
	});

	var bgExpand = new Expand({
		view: view,
		content: legend.domNode,
		expandIconClass: "esri-icon-collapse"
	});

	var scaleBar = new ScaleBar({
		view: view,
		unit: "non-metric"
	});
	view.ui.add(scaleBar, {
		position: "bottom-left"
	});

	var homeBtn = new Home({
		view: view
	});
	view.ui.add(homeBtn, "top-left");
	view.ui.add(bgExpand, "top-left");
}); 

function gotoresultspage(gotopage) {
	var table = document.getElementById("resultstable");
	var tableCode = "<table style='width:100%'>";
	var en = gotopage * 10, bn = en - 10;
	for (x = bn; x < en; x++) {
		if(!searchResults[x]){
			objid = commonname =" "
		} else {
			commonname = searchResults[x].feature.attributes.common_name;
			objid = searchResults[x].name;
			scientificName= searchResults[x].feature.attributes.scientific_name;
		}
	tableCode += "<tr id='" + objid + "_" + x + "' onclick= 'test("+ objid + ", " + x + ")'><td>" + objid + "</td><td>" + commonname + "</td></tr>";
	}
	tableCode += "</table>";
	table.innerHTML = tableCode;
}

function test(objid,arraypos){

	editFeature = searchResults[arraypos].feature;
	oid = searchResults[arraypos].feature.attributes.objectid;
	esripopupcontent = document.getElementsByClassName('esri-popup__content')[0];
	view.goTo(searchResults[arraypos].feature.geometry);

	commonname = searchResults[arraypos].feature.attributes.common_name;
	scientificname = searchResults[arraypos].feature.attributes.scientific_name;
  genus = searchResults[arraypos].feature.attributes.genus;
  specific_epithet = searchResults[arraypos].feature.attributes.specific_epithet;
  cultivar_subspecies = searchResults[arraypos].feature.attributes.cultivar_subspecies;
  family = searchResults[arraypos].feature.attributes.family;
  order_ = searchResults[arraypos].feature.attributes.order_;
  condition = searchResults[arraypos].feature.attributes.condition;
  height_m = searchResults[arraypos].feature.attributes.height_m;
  trunk_number = searchResults[arraypos].feature.attributes.trunk_number;
  average_trunk_dbh_cm = searchResults[arraypos].feature.attributes.average_trunk_dbh_cm;
  canopy_height_m = searchResults[arraypos].feature.attributes.canopy_height_m;
  canopy_width_m = searchResults[arraypos].feature.attributes.canopy_width_m;
  canopy_shape = searchResults[arraypos].feature.attributes.canopy_shape;
  biomass_mt = searchResults[arraypos].feature.attributes.biomass_mt;
  co2_sequestration_kg = searchResults[arraypos].feature.attributes.co2_sequestration_kg;
  tag_status = searchResults[arraypos].feature.attributes.tag_status;
  tag_type = searchResults[arraypos].feature.attributes.tag_type;
  tag_attachment_type = searchResults[arraypos].feature.attributes.tag_attachment_type;
  owner = searchResults[arraypos].feature.attributes.owner;
  photo_urls = searchResults[arraypos].feature.attributes.photo_urls;

  
  
var UpdateAction = {
 
  title: "update",
  id: "update",
  image: "https://cdn1.iconfinder.com/data/icons/basic-ui-elements-color/700/012_refresh-512.png",
 
  };
  
  var ShowPic = {
 
  title: "show_picture",
  id: "show_picture",
  image: "http://vignette2.wikia.nocookie.net/jamescameronsavatar/images/e/e5/Google_Chrome_Icon.png/revision/latest?cb=20100429000905",
 
  };
  
  
  
  
  
	view.popup.open({
		location: searchResults[arraypos].feature.geometry,
		title: "CSULB Tree ID: " + searchResults[arraypos].feature.attributes.objectid,

		content: '' + 
			'<table>' +
				'<tr><td>Common Name</td><td>' + searchResults[arraypos].feature.attributes.common_name + '</td></tr>' +
				'<tr><td>Scientific Name</td><td>' + searchResults[arraypos].feature.attributes.scientific_name + '</td></tr>' +
				'<tr><td>genus</td><td>' + searchResults[arraypos].feature.attributes.genus + '</td></tr>' +
				'<tr><td>specific_epithet</td><td>' + searchResults[arraypos].feature.attributes.specific_epithet + '</td></tr>' +
				'<tr><td>cultivar_subspecies</td><td>' + searchResults[arraypos].feature.attributes.cultivar_subspecies + '</td></tr>' +
				'<tr><td>family</td><td>' + searchResults[arraypos].feature.attributes.family + '</td></tr>' +
				'<tr><td>order_</td><td>' + searchResults[arraypos].feature.attributes.order_ + '</td></tr>' +
				'<tr><td>condition</td><td>' + searchResults[arraypos].feature.attributes.condition + '</td></tr>' +
				'<tr><td>height_m</td><td>' + searchResults[arraypos].feature.attributes.height_m + '</td></tr>' +
				'<tr><td>trunk_number</td><td>' + searchResults[arraypos].feature.attributes.trunk_number + '</td></tr>' +
				'<tr><td>average_trunk_dbh_cm</td><td>' + searchResults[arraypos].feature.attributes.average_trunk_dbh_cm + '</td></tr>' +
				'<tr><td>canopy_height_m</td><td>' + searchResults[arraypos].feature.attributes.canopy_height_m + '</td></tr>' +
				'<tr><td>canopy_width_m</td><td>' + searchResults[arraypos].feature.attributes.canopy_width_m + '</td></tr>' +
				'<tr><td>canopy_shape</td><td>' + searchResults[arraypos].feature.attributes.canopy_shape + '</td></tr>' +
				'<tr><td>biomass_mt</td><td>' + searchResults[arraypos].feature.attributes.biomass_mt + '</td></tr>' +
				'<tr><td>co2_sequestration_kg</td><td>' + searchResults[arraypos].feature.attributes.co2_sequestration_kg + '</td></tr>' +
				'<tr><td>tag_status</td><td>' + searchResults[arraypos].feature.attributes.tag_status + '</td></tr>' +
				'<tr><td>tag_type</td><td>' + searchResults[arraypos].feature.attributes.tag_type + '</td></tr>' +
				'<tr><td>tag_attachment_type</td><td>' + searchResults[arraypos].feature.attributes.tag_attachment_type + '</td></tr>' +
				'<tr><td>owner</td><td>' + searchResults[arraypos].feature.attributes.owner + '</td></tr>' +
				'<tr><td>photo_urls</td><td>' + searchResults[arraypos].feature.attributes.photo_urls + '</td></tr>' +
				
				
				'</table>',
			actions: [{
				id: "edit",
				image: "http://vignette2.wikia.nocookie.net/howtoprogram/images/8/8d/Pencil-icon.png/revision/latest?cb=20130521031501",
				title: "edit"
			}]
	});


  view.popup.actions.push(UpdateAction);
view.popup.actions.push(ShowPic);


	view.popup.on("trigger-action", function(event) {
		if (event.action.id === "edit") {
		  
		setupEditing(searchResults[arraypos]);
		console.log(this);
		}
		if (event.action.id === "update") {
		  
		 
		  editFeature.attributes["common_name"] = document.querySelector('.esri-popup__content #common_name input').value;
		  editFeature.attributes["scientific_name"] = document.querySelector('.esri-popup__content #scientific_name input').value;
		  editFeature.attributes["genus"] = document.querySelector('.esri-popup__content #genus input').value;
		  editFeature.attributes["specific_epithet"] = document.querySelector('.esri-popup__content #specific_epithet input').value;
		  editFeature.attributes["cultivar_subspecies"] = document.querySelector('.esri-popup__content #cultivar_subspecies input').value;
		  editFeature.attributes["family"] = document.querySelector('.esri-popup__content #family input').value;
		  editFeature.attributes["order_"] = document.querySelector('.esri-popup__content #order_ input').value;
		  editFeature.attributes["condition"] = document.querySelector('.esri-popup__content #condition input').value;
		  editFeature.attributes["height_m"] = document.querySelector('.esri-popup__content #height_m input').value;
		  editFeature.attributes["trunk_number"] = document.querySelector('.esri-popup__content #trunk_number input').value;
		  editFeature.attributes["average_trunk_dbh_cm"] = document.querySelector('.esri-popup__content #average_trunk_dbh_cm input').value;
		  editFeature.attributes["canopy_height_m"] = document.querySelector('.esri-popup__content #canopy_height_m input').value;
		  editFeature.attributes["canopy_width_m"] = document.querySelector('.esri-popup__content #canopy_width_m input').value;
		  editFeature.attributes["canopy_shape"] = document.querySelector('.esri-popup__content #canopy_shape input').value;
		  editFeature.attributes["biomass_mt"] = document.querySelector('.esri-popup__content #biomass_mt input').value;
		  editFeature.attributes["co2_sequestration_kg"] = document.querySelector('.esri-popup__content #co2_sequestration_kg input').value;
		  editFeature.attributes["tag_status"] = document.querySelector('.esri-popup__content #tag_status input').value;
		  editFeature.attributes["tag_type"] = document.querySelector('.esri-popup__content #tag_type input').value;
		  editFeature.attributes["tag_attachment_type"] = document.querySelector('.esri-popup__content #tag_attachment_type input').value;
		  editFeature.attributes["owner"] = document.querySelector('.esri-popup__content #owner input').value;
		  editFeature.attributes["photo_urls"] = document.querySelector('.esri-popup__content #photo_urls input').value;
		
		
		
		
		  editFeature.attributes["objectid"] = oid;
		  var edits = {
		updateFeatures: [editFeature]
	};
	console.log(editFeature.attributes);

	applyEdits(edits);
		  
	 

		}
		
		
		  if (event.action.id === "show_picture") {
          
              window.open("https://www.google.com/search?q=" +
                commonname);
         
            
          }
		
		
		

  	});
}


   function setupEditing(sr) {



	esripopupcontent = document.getElementsByClassName('esri-popup__content')[0];


	esripopupcontent.innerHTML = '' +
		'<table>' +
			'<tr><td>Common Name</td><td id="common_name"><input value="' + commonname + '"/></td></tr>' +
			'<tr><td>Scientific Name</td><td id="scientific_name"><input value="' + scientificname + '"/></td></tr>' +
		  '<tr><td>genus</td><td id="genus"><input value="' + genus + '"/></td></tr>' +
		  '<tr><td>specific_epithet</td><td id="specific_epithet"><input value="' + specific_epithet + '"/></td></tr>' +
		  '<tr><td>cultivar_subspecies</td><td id="cultivar_subspecies"><input value="' + cultivar_subspecies + '"/></td></tr>' +
		  '<tr><td>family</td><td id="family"><input value="' + family + '"/></td></tr>' +
		  '<tr><td>order_</td><td id="order_"><input value="' + order_ + '"/></td></tr>' +
		  '<tr><td>condition</td><td id="condition"><input value="' + condition + '"/></td></tr>' +
		  '<tr><td>height_m</td><td id="height_m"><input value="' + height_m + '"/></td></tr>' +
		  '<tr><td>trunk_number</td><td id="trunk_number"><input value="' + trunk_number + '"/></td></tr>' +
		  '<tr><td>average_trunk_dbh_cm</td><td id="average_trunk_dbh_cm"><input value="' + average_trunk_dbh_cm + '"/></td></tr>' +
		  '<tr><td>canopy_height_m</td><td id="canopy_height_m"><input value="' + canopy_height_m + '"/></td></tr>' +
		  '<tr><td>canopy_width_m</td><td id="canopy_width_m"><input value="' + canopy_width_m + '"/></td></tr>' +
		  '<tr><td>canopy_shape</td><td id="canopy_shape"><input value="' + canopy_shape + '"/></td></tr>' +
		  '<tr><td>biomass_mt</td><td id="biomass_mt"><input value="' + biomass_mt + '"/></td></tr>' +
		  '<tr><td>co2_sequestration_kg</td><td id="co2_sequestration_kg"><input value="' + co2_sequestration_kg + '"/></td></tr>' +
		  '<tr><td>tag_status</td><td id="tag_status"><input value="' + tag_status + '"/></td></tr>' +
		  '<tr><td>tag_type</td><td id="tag_type"><input value="' + tag_type + '"/></td></tr>' +
		  '<tr><td>tag_attachment_type</td><td id="tag_attachment_type"><input value="' + tag_attachment_type + '"/></td></tr>' +
		  '<tr><td>owner</td><td id="owner"><input value="' + owner + '"/></td></tr>' +
		  '<tr><td>photo_urls</td><td id="photo_urls"><input value="' + photo_urls + '"/></td></tr>' +
		  
		  
		  
			'</table>';
}
	
	
	
	function applyEdits(params) {		
		var promise = tree.applyEdits(params);
		promise.then(function(response) {
			var updatedFeatureObjectId = response.updateFeatureResults[0].objectId;
			console.log('Updated ', updatedFeatureObjectId);
                  alert("Updated!");
      
		})
		.otherwise(function(error) {
			console.error("[ applyEdits ] FAILURE: ", error.code, error.name,
				error.message);
			console.log("error = ", error);
		});
	}




</script>
<style>
	.esri-ui-top-right{
	position:fixed;
	margin-top:75px;
	margin-right:15px;
	}
</style>

</body>

