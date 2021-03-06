sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessagePopover",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode",
    "sap/ui/core/message/Message",
    "sap/m/MessageBox",
    'sap/m/MessageToast',
    'sap/ui/core/BusyIndicator'
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller, MessagePopover, JSONModel, BindingMode, Message, MessageBox, MessageToast,BusyIndicator) {
        "use strict";
        var oMessageManager, oModelM, oViewM, oMaterialInput, oPlant;
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
            },
            onBeforeRendering: function () {
                var oPlant = new sap.ui.model.odata.v2.ODataModel("sap/opu/odata/sap/YMM_GMT_SRV", true, "", "");
                oPlant.read("/gmt311Set", {
                    success: function (oData, oResponse) {
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
                var oText = this.getView().byId("success").setVisible(false);
            },
            _getMessagePopover: function () {
                // create popover lazily (singleton)
                if (!this._oMessagePopover) {
                    this._oMessagePopover = sap.ui.xmlfragment("ns.project1.view.MessagePopover", this);
                    this.getView().addDependent(this._oMessagePopover);
                }
                return this._oMessagePopover;
            },
            onClear: function () {
                this.getView().byId("iMatnr").setValue(null);
                this.getView().byId("iFromSloc").setValue(null);
                this.getView().byId("iToSloc").setValue(null);
                this.getView().byId("iQuant").setValue(null);
                this.getView().byId("iUom").setValue(null);
                this.getView().byId("Mat_desc").setText(null);
                this.getView().byId("success").setText(null);                
                var oModel = this.getView().getModel("Results");
                if (oModel) {
                    oModel.setData(null);
                }
                var colList = this.getView().byId("colList");
                colList.unbindCells();

                var iTab = this.getView().byId("iTab");
                iTab.setVisible(false);

                var messageProc = sap.ui.getCore().getMessageManager();
                messageProc.removeAllMessages();

                var oModel1 = this.getView();
                oModel1.getModel("message").setData(null);
                this.getView().byId("logs").setVisible(false);
                 this.setState();
            },
            onPost: function (oEvent) {
                this.showBusyIndicator(0);
                var oModel = new sap.ui.model.odata.v2.ODataModel("sap/opu/odata/sap/YMM_GMT_SRV", true, "", "");
                oModel.setUseBatch(false);
                var oEntry = {};
                oEntry.Plant     = this.getView().byId("iPlant").getValue();
                oEntry.Material  = this.getView().byId("iMatnr").getValue();
                oEntry.StgeLoc   = this.getView().byId("iFromSloc").getValue();
                oEntry.EntryQnt  = this.getView().byId("iQuant").getValue();
                oEntry.EntryUom  = this.getView().byId("iUom").getValue();
                oEntry.MoveStloc = this.getView().byId("iToSloc").getValue();

                this.onValidate(oEntry);       // Validate fields 
                oModel.create("/gmt311Set", oEntry, {
                    method: "POST",
                    success: function (oData, oResponse) {
                        this.hideBusyIndicator();
                        var hdrMessage = oResponse.headers["sap-message"];
                        var hdrMessageObject = JSON.parse(hdrMessage);
                        var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
                        MessageToast.show(hdrMessageObject.message, {
                            duration: 5000
                        });
                        var messageProc = sap.ui.getCore().getMessageManager();
                        messageProc.removeAllMessages();
                         this.onClear();
                    }.bind(this),
                    error: function (oResponse) {
                        this.hideBusyIndicator();
                        var errMessage = oResponse.headers["sap-message"];
                        var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
                        if (oEntry.Material) {
                            // MessageBox.error(
                            //     "Error occured. Please see the Message Popover", {
                            //     styleClass: bCompact ? "sapUiSizeCompact" : ""
                            // }
                            // );
                        }
                        else{
                        var messageProc = sap.ui.getCore().getMessageManager();
                        messageProc.removeAllMessages();
                        }
                    }.bind(this)
                });
               
            },
            onValidate: function (oEntry) {
                var oInput1 = this.getView().byId(this.getView().createId("iMatnr"));
                if (!oEntry.Material) {
                    oInput1.setValueState(sap.ui.core.ValueState.Error);
                    oInput1.setValueStateText("Material field cannot be empty.");
                }
                var oInput3 = this.getView().byId(this.getView().createId("iFromSloc"));
                if (!oEntry.StgeLoc) {
                    oInput3.setValueState(sap.ui.core.ValueState.Error);
                    oInput3.setValueStateText("From storage location field cannot be empty.");
                }
                var oInput4 = this.getView().byId(this.getView().createId("iQuant"));
                if (!oEntry.EntryQnt) {
                    oInput4.setValueState(sap.ui.core.ValueState.Error);
                    oInput4.setValueStateText("Quantity field cannot be empty.");
                }
                var oInput5 = this.getView().byId(this.getView().createId("iUom"));
                if (!oEntry.EntryUom) {
                    oInput5.setValueState(sap.ui.core.ValueState.Error);
                    oInput5.setValueStateText("Unit field cannot be empty.");
                }
                var oInput6 = this.getView().byId(this.getView().createId("iToSloc"));
                if (!oEntry.MoveStloc) {
                    oInput6.setValueState(sap.ui.core.ValueState.Error);
                    oInput6.setValueStateText("To Storage location field cannot be empty.");
                }
            },
            onChange: function (oEvent) {
                var messageProc = sap.ui.getCore().getMessageManager();
                messageProc.removeAllMessages();
                if (oEvent) {
                    var oInput = oEvent.getSource();
                    var oValue = oInput.getValue();
                }
                if (!oValue) {
                    oValue = this.getView().byId("iMatnr").getValue();
                }
                if (oValue) {
                    var oMod = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/YMM_GMT_SRV", true, "", "");
                    oMod.read("/slocSet('" + oValue + "')", {
                        success: function (odata) {
                            var oInput = this.getView().byId(this.getView().createId("iMatnr"));
                            oInput.setValueState(sap.ui.core.ValueState.Success);
                            this.byId("Mat_desc").setText(odata.Maktx);
                            this.byId("iUom").setValue(odata.Meins);
                            this.byId("iUom").setEnabled(false)
                            var oView = this.getView();
                            this.sLoc(oValue, oView);
                            this.setState();
                        }.bind(this),
                        error: function (oResponse) {
                            var messageProc = sap.ui.getCore().getMessageManager();
                            messageProc.removeAllMessages();
                            oInput.setValueState(sap.ui.core.ValueState.Error);
                            oInput.setValueStateText("Material not present in plant.");
                            this.byId("Mat_desc").setText(null);
                        }.bind(this)
                    });
                }
                this.getView().byId("iFromSloc").focus();
            },
            sLoc: function (oValue, oView) {
                var oModSloc = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/YMM_GMT_SRV", true, "", "");
                //Get the view for table        
                var iTab = this.getView().byId("iTab");
                oModSloc.read("/slocSet('" + oValue + "')/sLocNav", {
                    success: function (oData) {
                        var oJSONModel = new sap.ui.model.json.JSONModel(oData);
                        // var oView = this.getView().
                        oView.setModel(oJSONModel, "Results");
                    }
                });
                iTab.setVisible(true);
            },
            onSearchHelp: function (oEvent) {
                //This code was generated by the layout editor.
                var skip = 0; // Start pointing of record
                var top = 20; //Size of the record

                if (!this._oDialog) {
                    this._oDialog = sap.ui.xmlfragment("ns.project1.view.MatnrSearch", this);
                }
                this._oDialog.setBusy(true);
                oPlant = this.getView().byId("iPlant").getValue();
                var sServiceUrl = "/sap/opu/odata/sap/YF4_ONE_IN_ALL_SRV/Mat1wESet('" + oPlant + "')/matnrNav?$format=json&$top=" + top + "&$skip=" + skip + "";

                this._oModel = new sap.ui.model.json.JSONModel();
                this._oModel.loadData(sServiceUrl);
                this._oModel.attachRequestCompleted(function () {
                    this._oDialog.setBusy(false);
                    this._oDialog.setModel(this._oModel, "MatnrSearch");
                }, this);
                this.getView().addDependent(this._oDialog);
                // toggle compact style
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
                this._oDialog.open();
            },
            handleSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("Matnr", sap.ui.model.FilterOperator.Contains, sValue);
                var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([oFilter]);
            },
            handleClose: function (oEvent) {
                var oInput = this.getView().byId(this.getView().createId("iMatnr"));
                var aContexts = oEvent.getParameter("selectedContexts");
                if (aContexts && aContexts.length) {
                    var sValue = aContexts[0].getObject().Matnr;
                    oInput.setValue(sValue);
                    oInput.setValueState(sap.ui.core.ValueState.None);
                    this.onChange();
                }
                oEvent.getSource().getBinding("items").filter([]);
            },
            onSlocHelpRequested: function (oEvent) {
                //This code was generated by the layout editor.
                this.aTokens = oEvent.getParameter("id");
                var skip = 0; // Start pointing of record
                var top = 20; //Size of the record
                if (!this._pDialog) {
                    this._pDialog = sap.ui.xmlfragment("ns.project1.view.slocSearch", this);
                }
                oPlant = this.getView().byId("iPlant").getValue();
                var sServiceUrl = "/sap/opu/odata/sap/YF4_ONE_IN_ALL_SRV/HT001lOldSet('" + oPlant + "')/sLocNav?$format=json&$top=" + top + "&$skip=" + skip + "";

                this._oModel1 = new sap.ui.model.json.JSONModel();
                this._oModel1.loadData(sServiceUrl);
                this._oModel1.attachRequestCompleted(function () {
                    this._pDialog.setBusy(false);
                    this._pDialog.setModel(this._oModel1, "slocSearch");
                }, this);
                this.getView().addDependent(this._pDialog);
                // toggle compact style
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._pDialog);
                this._pDialog.open();
            },
            handleSlocSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("Lgort", sap.ui.model.FilterOperator.Contains, sValue);
                var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([oFilter]);
            },
            handleSlocClose: function (oEvent) {
                var oInput = this.getView().byId(this.aTokens);
                var aContexts = oEvent.getParameter("selectedContexts");
                if (aContexts && aContexts.length) {
                    var sValue = aContexts[0].getObject().Lgort;
                    oInput.setValue(sValue);
                    oInput.setValueState(sap.ui.core.ValueState.None);
                }
                oEvent.getSource().getBinding("items").filter([]);
            },
            setState: function () {
                var oInput1 = this.getView().byId(this.getView().createId("iMatnr"));
                oInput1.setValueState(sap.ui.core.ValueState.None);
                var oInput2 = this.getView().byId(this.getView().createId("iFromSloc"));
                oInput2.setValueState(sap.ui.core.ValueState.None);
                var oInput3 = this.getView().byId(this.getView().createId("iToSloc"));
                oInput3.setValueState(sap.ui.core.ValueState.None);
                var oInput4 = this.getView().byId(this.getView().createId("iQuant"));
                oInput4.setValueState(sap.ui.core.ValueState.None);
                var oInput5 = this.getView().byId(this.getView().createId("iUom"));
                oInput5.setValueState(sap.ui.core.ValueState.None);
            },
            showBusyIndicator : function (iDuration, iDelay) {
			BusyIndicator.show(iDelay);

			if (iDuration && iDuration > 0) {
				if (this._sTimeoutId) {
					clearTimeout(this._sTimeoutId);
					this._sTimeoutId = null;
				}

				this._sTimeoutId = setTimeout(function() {
					this.hideBusyIndicator();
				}.bind(this), iDuration);
			}
        },
        	hideBusyIndicator : function() {
			BusyIndicator.hide();
        },
        onSelect: function(oEvent){
            
           var oItem = oEvent.getSource().getBindingContext("Results").getObject(); 
           var Fsloc = this.getView().byId("iFromSloc").getValue();
           var Tsloc = this.getView().byId("iToSloc").getValue();
           if(!Fsloc){
           this.getView().byId("iFromSloc").setValue(oItem.Lgort);
           this.getView().byId("iToSloc").focus();
           }
           else if(!Tsloc) {
               this.getView().byId("iToSloc").setValue(oItem.Lgort);
               this.getView().byId("iQuant").focus();
           }
                         
        }

        });
    });