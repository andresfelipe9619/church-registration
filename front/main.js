/* <script type="text/babel"> */

$(document).ready(init_js);
var personIndex;
function init_js() {
  $(".numeric").on("keypress", function(e) {
    return (
      e.metaKey || // cmd/ctrl
      e.which <= 0 || // arrow keys
      e.which == 8 || // delete key
      /[0-9]/.test(String.fromCharCode(e.which))
    ); // numbers
  });

  $("#busca-cedula").on("keyup", function(event) {
    event.preventDefault();
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Trigger the button element with a click
      document.getElementById("btn-search").click();
    }
  });
}

function validationpassed(e) {
  try {
    e.preventDefault();
    var mForm = $(".ui.form");
    var formData = mForm.serializeArray();
    mForm.addClass("loading");

    var invitados = $("input[name='invited']:checked").val();

    registerDinner(personIndex, invitados);
  } catch (error) {
    $(".ui.error.message").text(error.toString());
  }
}

function searchForPerson() {
  $("#btn-search").addClass("loading");

  var onSuccess = function(person) {
    if (person) {
      if (person.index > -1) {
        $(".ui.form").addClass("loading");
        console.log("A nice formatted person", person);
        $("#btn-search").removeClass("loading");
        $("input[name='cedula']").prop("readonly", true);
        $("input[name='cedula']").addClass("not-allowed");
        if (person.isRegistered) {
          loadPersonInForm(person);
        } else {
          $(".ui.form").removeClass("loading");
        }
      } else {
        $("#btn-search").removeClass("loading");
        $("#search-msg").html("No se encuentra registrado");
        $("#search-msg").css("display", "block");
        setTimeout(function() {
          $("#search-msg").html("No se encuentra registrado");
          $("#search-msg").css("display", "none");
        }, 3000);
      }
    } else {
      console.log("Something went wrong searching user...");
    }
  };

  var cedula = $("#busca-cedula").val();
  if (cedula.length > 0) {
    google.script.run.withSuccessHandler(onSuccess).searchPerson(cedula);
  } else {
    $("#btn-search").removeClass("loading");
    $("#search-msg").html("Por favor ingrese una cedula");
    $("#search-msg").css("display", "block");
    setTimeout(function() {
      $("#search-msg").html("Por favor ingrese una cedula");
      $("#search-msg").css("display", "none");
    }, 3000);
  }
}

function disableFormFielfds(bool) {
  if (bool) {
    $("input:not([name='busca-cedula'],[name='invited'])").prop(
      "readonly",
      true
    );
    $("input:not([name='busca-cedula'])").addClass("not-allowed");
    $(".ui.radio.checkbox").checkbox();
    $(".ui.radio.checkbox").addClass("read-only");
    $(".ui.radio.checkbox").addClass("not-allowed");
    $("input[type='radio']").addClass("not-allowed");
  } else {
    $("input:not([name='busca-cedula'],[name='invited'])").prop(
      "readonly",
      false
    );
    $("input:not([name='busca-cedula'])").removeClass("not-allowed");
    $(".ui.radio.checkbox").checkbox();
    $(".ui.radio.checkbox").removeClass("read-only");
    $(".ui.radio.checkbox").removeClass("not-allowed");
    $("input[type='radio']").removeClass("not-allowed");
  }
}

function loadPersonInForm(person) {
  console.log("Person in form", person);
  personIndex = Number(person.index) + 1;
  $("input[name='nombres']").val(person.data.nombres);
  $("input[name='apellidos']").val(person.data.apellidos);
  $("input[name='cedula']").val(person.data.cedula);
  $("input[name='correo']").val(person.data.correo);
  $("input[name='celular']").val(person.data.celular);
  $("select[name='programa']").dropdown("set selected", person.data.programa);
  $("select[name='facultad']").dropdown("set selected", person.data.facultad);

  if (person.data["invitados"] == "SI") {
    $("#sir").prop("checked", true);
  }
  disableFormFielfds(true);

  if (person.data["hora_ingreso"] != "" && person.data["invitados"] != "") {
    $("#submit-btn").addClass("not-visible");
    $("#pay-msg").removeClass("not-visible");
    $("#pay-msg").removeClass("warning");
    $("#pay-msg").addClass("success");
    $("#pay-msg").append(`<i class="icon check circle"></i>
           Disfrute de su cena, no puede repetir mas.
          </div>`);
  } else if (person.data["pago_comprobado"] == "SI") {
    $("#pay-msg").removeClass("not-visible");
    $("#pay-msg").removeClass("warning");
    $("#pay-msg").addClass("success");
    $("#pay-msg").append(`<i class="icon check circle"></i>
            El pago de su inscripción a la Noche de Gala de Egresados fue registrado satisfactoriamente.
          </div>`);
    $(".ui.radio.checkbox").checkbox();
    $(".ui.radio.checkbox").removeClass("read-only");
    $(".ui.radio.checkbox").removeClass("not-allowed");
    $("input[type='radio']").removeClass("not-allowed");
  } else {
    $("#submit-btn").addClass("not-visible");
    $("#pay-msg").removeClass("not-visible");
    $("#pay-msg").removeClass("success");
    $("#pay-msg").addClass("warning");

    $("#pay-msg").append(`<i class="icon warning "></i>
            El pago de su inscripción aun no ha sido registrado. Por favor realize su pago para acceder ala cena
          </div>`);
  }

  $(".ui.dropdown").addClass("disabled");
  $(".fields.regreso").addClass("not-allowed");
  $(".ui.form").removeClass("loading");
}

function registerDinner(index, invited) {
  $("#submit-btn").addClass("loading");

  if (personIndex > -1) {
    function onSuccess(result) {
      $("#submit-btn").removeClass("loading");
      if (result) {
        console.log("result", result);
        return true;
      }
    }
    return google.script.run
      .withSuccessHandler(onSuccess)
      .generatePayment(index, invited);
  }
}


function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function(e) {
      $("#prev").attr("src", e.target.result);
    };

    reader.readAsDataURL(input.files[0]);
  }
}

$("#imgInp").change(function() {
  readURL(this);
});

// </script>
