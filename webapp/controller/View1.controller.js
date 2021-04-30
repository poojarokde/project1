sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessagePopover",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode",
    "sap/ui/core/message/Message",
    "sap/m/MessageBox"

],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller, MessagePopover, JSONModel, BindingMode, Message, MessageBox) {
        "use strict";
        var oMessageManager, oModelM, oViewM, oMaterialInput;
        return Controller.extend("ns.project1.controller.View1", {
            onInit: function () {

                this._oView = this.getView();

                oViewM = this.getView();
                // // set message model
                oMessageManager = sap.ui.getCore().getMessageManager();
                oViewM.setModel(oMessageManager.getMessageModel(), "message");

                // or just do it for the whole view
                oMessageManager.registerObject(oViewM, true);

                // create a default model with somde demo data
                oModelM = new JSONModel({
                    MandatoryInputValue: "",
                    DateValue: null,
                    IntegerValue: undefined,
                    Dummy: ""
                });
                oModelM.setDefaultBindingMode(BindingMode.TwoWay);
                oViewM.setModel(oModelM);

                // this._oMultiInput = this.getView().byId("iMatnr");
                // this.oColModel = new JSONModel(sap.ui.require.toUrl("ns/project1/model") + "/MatnrModel.json");
                // this.oMaterialModel = new JSONModel(sap.ui.require.toUrl("sap/opu/odata/sap/YMM_GMT_SRV");
            },
            onBeforeRendering: function () {

                var oPlant = new sap.ui.model.odata.v2.ODataModel("sap/opu/odata/sap/YMM_GMT_SRV", true, "", "");
                oPlant.read("/gmt311Set", {
                    success: function (oData, oResponse) {

                        // oPlant.attachMetadataLoaded(null, function () {
                        var oMeta = oPlant.getServiceMetadata();
                        var headerFields = "";
                        var field;
                        for (var i = 0; i < oMeta.dataServices.schema[0].entityType[0].property.length; i++) {
                            var property = oMeta.dataServices.schema[0].entityType[0].property[i];
                            field = property.name;

                            var extensions = property.extensions;
                            for (var a = 0; a < extensions.length; a++) {
                                var field1 = extensions[a].name;
                                if (field1 == 'label') {
                                    headerFields = extensions[a].value;
                                    if (field == 'Plant') {
                                        this._oView.byId("Plant").setText(headerFields);
                                    }
                                    if (field == 'Material') {
                                        this._oView.byId("Material").setText(headerFields);
                                    }
                                    if (field == 'StgeLoc') {
                                        this._oView.byId("StgeLoc").setText(headerFields);
                                    }
                                    if (field == 'MoveStloc') {
                                        this._oView.byId("MoveStloc").setText(headerFields);
                                    }
                                    if (field == 'EntryQnt') {
                                        this._oView.byId("EntryQnt").setText(headerFields);
                                    }
                                }
                            }

                        }


                        var data = oData.results[0];
                        this._oView.byId("iPlant").setValue(data.Plant);
                        this._oView.byId("iPlant").setEnabled(false);
                    }.bind(this),
                    error: function (oResponse) {
                        // var errMessage = oResponse.headers["sap-message"];
                        // var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
                        MessageBox.error(
                            "Defalt Plant NOt Found.", {
                            styleClass: bCompact ? "sapUiSizeCompact" : ""
                        }
                        );
                    }.bind(this)
                });

            },
            onMessagePopoverPress: function (oEvent) {
                this._getMessagePopover().openBy(oEvent.getSource());
            },
            _getMessagePopover: function () {
                // create popover lazily (singleton)
                if (!this._oMessagePopover) {
                    this._oMessagePopover = sap.ui.xmlfragment("ns.project1.view.MessagePopover", this);
                    this.getView().addDependent(this._oMessagePopover);
                }
                return this._oMessagePopover;
            },
            onPost: function (oEvent) {

                var oModel = new sap.ui.model.odata.v2.ODataModel("sap/opu/odata/sap/YMM_GMT_SRV", true, "", "");
                oModel.setUseBatch(false);
                var oEntry = {
                    Material: "KB54002",
                    Plant: "1400",
                    StgeLoc: "0001",
                    EntryQnt: "1.00",
                    EntryUom: "EA",
                    MovePlant: "1400",
                    MoveStloc: "STOP",
                    ITEM_TEXT: ""
                };

                // var oEntry = {};
                // oEntry.Material = this.getView().byId("iMatnr").getValue();
                // oEntry.Plant = this.getView().byId("iPlant").getValue();
                // oEntry.StgeLoc = this.getView().byId("iFromSloc").getValue();
                // oEntry.EntryQnt = this.getView().byId("iQuant").getValue();
                // oEntry.EntryUom = this.getView().byId("iUom").getValue();               
                // oEntry.MoveStloc = this.getView().byId("iToSloc").getValue(); 

                oModel.create("/gmt311Set", oEntry, {
                    method: "POST",
                    success: function (oData, oResponse) {
                        var hdrMessage = oResponse.headers["sap-message"];
                        var hdrMessageObject = JSON.parse(hdrMessage);
                        var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
                        // MessageBox.success(
                        //     hdrMessageObject.message, { // contains success message -> pass in text in footer
                        //     styleClass: bCompact ? "sapUiSizeCompact" : ""
                        // }
                        // );
                    }.bind(this),
                    error: function (oResponse) {
                        var errMessage = oResponse.headers["sap-message"];
                        var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
                        MessageBox.error(
                            "Error occured. Please see the Message Popover", {
                            styleClass: bCompact ? "sapUiSizeCompact" : ""
                        }
                        );
                    }.bind(this)
                });

                this.getView().byId("iMatnr").setValue(null);
                this.getView().byId("iFromSloc").setValue(null);
                this.getView().byId("iToSloc").setValue(null);
                this.getView().byId("iQuant").setValue(null);
                this.getView().byId("iUom").setValue(null);
                var oTab = sap.ui.getCore().byId("iTab");
                if (oTable.isBound("rows")) {

                    oTable.unbindRows();

                }
            },
            onChange: function (oEvent) {

                var oInput = oEvent.getSource();
                var oValue = oInput.getValue();

                if (oValue) {
                    var oModSloc = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/YMM_GMT_SRV", true, "", "");
                    //Get the view for table        
                    var iTab = this.getView().byId("iTab");
                    oModSloc.read("/slocSet('" + oValue + "')/sLocNav", {
                        success: function (oData) {
                            var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                            this._oView.setModel(oJSONModel, "SLOC");
                            var oMetadata = oJSONModel.getMetadata();
                            //Set Model
                            iTab.setModel(oJSONModel, "Results");
                          
                            
                            this.byId("Mat_desc").setText(oData.results[0].Maktx);
                            this.byId("iUom").setText(oData.results[0].Meins);
                            this.byId("iUom").setEnabled(false)
                            // Set line items dynamically
                            if (oData && oData.results) {
                                var aColList = new sap.m.ColumnListItem({
                                    cells: [
                                        new sap.m.Text({ text: "{Results>Lgobe}" }),
                                        new sap.m.Text({ text: "{Results>Lgort}" }),
                                        new sap.m.Text({ text: "{Results>Labst}" })
                                    ]
                                });
                                iTab.bindItems("Results>/results", aColList) // bind rows


                            }
                        }.bind(this),
                        error: function (oResponse) {
                            var body = JSON.parse(oResponse.response.body);
                            var errorDetails = body.error.message.value;

                            var bCompact = !!oViewM.$().closest(".sapUiSizeCompact").length;
                            MessageBox.error(
                                errorDetails, {
                                styleClass: bCompact ? "sapUiSizeCompact" : ""
                            }
                            );
                        }.bind(this)
                    });
                    iTab.bindProperty("visible", "true");
                }
            },
            onMatnrHelpRequested: function () {
                this._oValueHelpDialog = sap.ui.xmlfragment("ns.project1.view.MatnrSearch", this);
                this.getView().addDependent(this._oValueHelpDialog);
                this._oValueHelpDialog.open();
            },
            //     this._oValueHelpDialog.getTableAsync().then(function (oTable) {
            //         oTable.setModel(this.oProductsModel);
            //         oTable.setModel(this.oColModel, "columns");

            //         if (oTable.bindRows) {
            //             oTable.bindAggregation("rows", "/ProductCollection");
            //         }

            //         if (oTable.bindItems) {
            //             oTable.bindAggregation("items", "/ProductCollection", function () {
            //                 return new ColumnListItem({
            //                     cells: aCols.map(function (column) {
            //                         return new Label({ text: "{" + column.template + "}" });
            //                     })
            //                 });
            //             });
            //         }
            //         this._oValueHelpDialog.update();
            //     }.bind(this));

            //     this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
            //     this._oValueHelpDialog.open();
            // },

            onSlocHelpRequested: function () {
                // var aCols = this.oColModel.getData().cols;

                this._oValueHelpDialog = sap.ui.xmlfragment("ns.project1.view.slocSearch", this);
                this.getView().addDependent(this._oValueHelpDialog);
                this._oValueHelpDialog.open();
            },
            onUOMHelpRequested: function () {
                // var aCols = this.oColModel.getData().cols;

                this._oValueHelpDialog = sap.ui.xmlfragment("ns.project1.view.UOMSearch", this);
                this.getView().addDependent(this._oValueHelpDialog);
                this._oValueHelpDialog.open();
            },
            onValueHelpOkPress: function (oEvent) {
                // var aTokens = oEvent.getParameter("tokens");
                // this._oMultiInput.setTokens(aTokens);
                this._oValueHelpDialog.close();
            },

            onValueHelpCancelPress: function () {
                this._oValueHelpDialog.close();
            },

            onValueHelpAfterClose: function () {
                this._oValueHelpDialog.destroy();
            }
        });
    });
