$('#post-comment').hide()
$('#btn-toggle-comment').click(e => {
    e.preventDefault()
    $('#post-comment').slideToggle() //Mostrarlo o no
})


// $('#btn-like').click(function (e) {
//     e.preventDefault()
//     let $this = $(this)
//     let activityID = $(this).data('id')

//     $.post('/activity/' + activityID + '/like')
//         .done(data => { //Cuando termine este post
//             $this.removeClass('btn-primary').addClass('btn-success')
//             $('.likes-count').text(data.likes)
//         })
// })

// $('#btn-report').click(function (e) {
//     e.preventDefault()
//     let $this = $(this)
//     let activityID = $(this).data('id')

//     $.post('/activity/' + activityID + '/report')
//         .done(() => { //Cuando termine este post
//             $('#exampleModalCenter').modal('hide');
//             //$.get('/activity/' + activityID)
//             //$('.likes-count').text(data.likes)
//         })
// })
$('#close').click(function () {
    $('#exampleModalCenter').modal('hide');
});

ScrollReveal().reveal('.card', { delay: 400 });

// $('#btn-modal').click(function (e) {
//     e.preventDefault()

//     $('#modal-date').modal()
// })


$.fn.datepicker.dates['es'] = {
    days: ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"],
    daysShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
    daysMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
    months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    monthsShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    today: "Hoy",
    clear: "Borrar",
    format: "yyyy-mm-dd",
    titleFormat: "MM yyyy", /* Leverages same syntax as 'format' */
    weekStart: 0
};

$('.mydatepicker').datepicker({
    format: "yyyy-mm-dd",
    todayBtn: "linked",
    clearBtn: true,
    language: "es",
    autoclose: true,
    todayHighlight: true,
    startDate: '0d'
});

jQuery.datetimepicker.setLocale('es')
$('#datetimepickerFrom').datetimepicker({
    timepicker: true,
    datepicker: true,
    format: "Y-m-d H:i",
    hours12: false,
    step: 30,
    //mask: true,
    lang: 'es',
    il8n: {
        month: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        daysofWeek: ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]
    },
    onShow: function (ct) {
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes()
        var dateTime = date + ' ' + time;
        this.setOptions({
            minDate: dateTime,
            yearStart: today.getFullYear()
        })
    }
    //theme: 'dark'
    // todayBtn: "linked",
    // clearBtn: true,
    // language: "es",
    // autoclose: true,
    // todayHighlight: true,
    // startDate: '0d'
});
$('#datetimepickerTo').datetimepicker({
    timepicker: true,
    datepicker: true,
    format: "Y-m-d H:i",
    hours12: false,
    step: 30,
    lang: 'es',
    il8n: {
        month: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        daysofWeek: ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]
    },
    onShow: function (ct) {
        today = new Date();
        this.setOptions({
            minDate: $('#datetimepickerFrom').val() ? $('#datetimepickerFrom').val() : false,
            yearStart: today.getFullYear()
        })
    }
});



// $('#myModal').on('shown.bs.modal', function () {
//     $('#myInput').trigger('focus')
//   })




/***************************** Enable Some Dates Only ****************************************/

// //we start with splitting the provided string into an array
// var enableDays = "10-06-2021, 11-06-2021, 12-06-2021, 13-06-2021".split(', ')

// function formatDate(d) {
//   var day = String(d.getDate())
//   //add leading zero if day is is single digit
//   if (day.length == 1)
//     day = '0' + day
//   var month = String((d.getMonth()+1))
//   //add leading zero if month is is single digit
//   if (month.length == 1)
//     month = '0' + month
//   return day + "-" + month + "-" + d.getFullYear()
// }

// $(function () {
//     $('#mydatepickerProximasFechas').datepicker({
//         format: "dd-mm-yyyy",
//         language: "es",
//         autoclose: true,
//         todayHighlight: true,
//         beforeShowDay: function(date){
//           if (enableDays.indexOf(formatDate(date)) < 0)
//             return {
//               enabled: false
//             }
//           else
//             return {
//               enabled: true
//             }
//         }
//   })
// });

// si hacemos un boton de borrar
/*
$('#btn-delete').click(function(e) {
    e.preventDefault()
    let productID = $(this).data('id')
    const response = confirm('Are you sure?')
    if (response) {
        $.ajax({
            URL: '/products/delete/' + productID,
            type: 'DELETE'
        })
        .done(result => { //Cuando termine este post

        })
    }
})
*/

// Add the following code if you want the name of the file appear on select
$(".custom-file-input").on("change", function () {
    var fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
});

