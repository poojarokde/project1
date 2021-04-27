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
        var oMessageManager, oModelM, oViewM;
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
                // oEntry.MovePlant = this.getView().byId("iPlant").getValue();
                // oEntry.MoveStloc = this.getView().byId("iToSloc").getValue();               


                oModel.create("/gmt311Set", oEntry, {
                    method: "POST",
                    success: function (oData, oResponse) {                                              
                        var hdrMessage = oResponse.headers["sap-message"];
                        var hdrMessageObject = JSON.parse(hdrMessage);
                        var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
                        MessageBox.success(
                            hdrMessageObject.message, {
                            styleClass: bCompact ? "sapUiSizeCompact" : ""
                        }
                        );
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
            }

        });
    });
