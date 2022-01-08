const $ = require('jquery')
const d3 = require('d3')
import * as lib from './start'
var counterContext;

$(function () {
    lib.initCmeans();
    lib.initGraph();

    $('#animspeed').on('change', function () {
        lib.animspeed = 100 + (100 - Number($("#animspeed").val())) * 15;
        timerfuncs();
    });

    d3.select("#iterate")
        .on("wheel", function () {
            document.getElementById("lblStatus").style.display = "block";
            document.getElementById("lblStatus").innerHTML = "Rendering plot...";
            setTimeout(function () {
                lib.cmeansLoop();
                lib.animate();
            }, 100);
        })
        .on("click", function () {
            document.getElementById("lblStatus").style.display = "block";
            document.getElementById("lblStatus").innerHTML = "Rendering plot...";
            setTimeout(function () {
                lib.cmeansLoop();
                lib.animate();
            }, 100);
        });
    d3.select("#setparams")
        .on("click", function () {
            lib.c = Number($("#noofc").val());
            lib.m = Number($("#mValue").val());
            lib.thresh = Number($("#threshold").val());
            lib.numDataPoints = Number($("#noofpoints").val());
            lib.animspeed = 100 + (100 - Number($("#animspeed").val())) * 15;
            lib.distFunc = Number($("#distFuncSel").val());
            $("#plot").empty();
            lib.initCmeans();
            lib.initGraph();
        });
    d3.select("#checktimer")
        .on("click", function () {
            timerfuncs();
        });
});

function timerfuncs() {
    clearInterval(counterContext);
    if ($('#checktimer').is(':checked')) {
        $('.csbutt').addClass('disabled');
        document.getElementById("lblStatus").style.display = "none";
        counterContext = setInterval(function () {
            lib.cmeansLoop();
            lib.animate();
        }, lib.animspeed + 150 + 10);
    } else {
        $('.csbutt').removeClass('disabled');
        //clearInterval(counterContext);
    }
}