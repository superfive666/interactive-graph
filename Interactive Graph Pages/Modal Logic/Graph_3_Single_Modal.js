import wixWindow from 'wix-window';
import {GraphBinding} from 'public/Controller.js';
import {PrepareBinding} from 'public/ModalLogic.js';

$w.onReady(function () {
    var data = wixWindow.lightbox.getContext();
    PrepareBinding(GraphBinding.SinglePatient, data);
});