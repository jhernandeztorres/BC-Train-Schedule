  // Initialize Firebase
  var config = {
      apiKey: "AIzaSyBE6MVHrrVbxtAZyNxtb4yDF-Qgt3plGTk",
      authDomain: "bc-train-schedule-94fbf.firebaseapp.com",
      databaseURL: "https://bc-train-schedule-94fbf.firebaseio.com",
      projectId: "bc-train-schedule-94fbf",
      storageBucket: "bc-train-schedule-94fbf.appspot.com",
      messagingSenderId: "320099494537"
  };

  firebase.initializeApp(config);

  var database = firebase.database();

  var trainName = "";
  var destination = "";
  var startTime = "";
  var frequency = 0;

  function currentTime() {
      var current = moment().format('LT');
      $("#currentTime").html(current);
      setTimeout(currentTime, 1000);
  };

  $(".form-field").on("keyup", function () {
      var trainTemp = $("#train-name").val().trim();
      var cityTemp = $("#destination").val().trim();
      var timeTemp = $("#first-train").val().trim();
      var freqTemp = $("#frequency").val().trim();

      sessionStorage.setItem("train", trainTemp);
      sessionStorage.setItem("city", cityTemp);
      sessionStorage.setItem("time", timeTemp);
      sessionStorage.setItem("freq", freqTemp);
  });

  $("#train-name").val(sessionStorage.getItem("train"));
  $("#destination").val(sessionStorage.getItem("city"));
  $("#first-train").val(sessionStorage.getItem("time"));
  $("#frequency").val(sessionStorage.getItem("freq"));

  $("#submit").on("click", function (event) {
      event.preventDefault();

      if ($("#train-name").val().trim() === "" ||
          $("#destination").val().trim() === "" ||
          $("#first-train").val().trim() === "" ||
          $("#frequency").val().trim() === "") {

          alert("Please fill in all details to add new train");

      } else {

          trainName = $("#train-name").val().trim();
          destination = $("#destination").val().trim();
          startTime = $("#first-train").val().trim();
          frequency = $("#frequency").val().trim();

          $(".form-field").val("");

          database.ref().push({
              trainName: trainName,
              destination: destination,
              frequency: frequency,
              startTime: startTime,
              dateAdded: firebase.database.ServerValue.TIMESTAMP
          });

          sessionStorage.clear();
      }

  });

  database.ref().on("child_added", function (childSnapshot) {
      var startTimeConverted = moment(childSnapshot.val().startTime, "hh:mm").subtract(1, "years");
      var timeDiff = moment().diff(moment(startTimeConverted), "minutes");
      var timeRemain = timeDiff % childSnapshot.val().frequency;
      var minToArrival = childSnapshot.val().frequency - timeRemain;
      var nextTrain = moment().add(minToArrival, "minutes");
      var key = childSnapshot.key;

      var newRow = $("<tr>");
      newRow.append($("<td class='text-center text-capitalize align-middle'>" + childSnapshot.val().trainName + "</td>"));
      newRow.append($("<td class='text-center text-capitalize align-middle'>" + childSnapshot.val().destination + "</td>"));
      newRow.append($("<td class='text-center align-middle'>" + childSnapshot.val().frequency + "</td>"));
      newRow.append($("<td class='text-center align-middle'>" + moment(nextTrain).format("LT") + "</td>"));
      newRow.append($("<td class='text-center align-middle'>" + minToArrival + "</td>"));
      newRow.append($("<td class='text-center align-middle'><button class='arrival btn btn-danger btn-xs' data-key='" + key + "'><i class='fas fa-trash-alt'></i></button></td>"));

      if (minToArrival < 6) {
          newRow.addClass("info");
      }

      $("#train-table-rows").append(newRow);

  });

  $(document).on("click", ".arrival", function () {
      keyRef = $(this).attr("data-key");
      database.ref().child(keyRef).remove();
      window.location.reload();
  });

  currentTime();

  setInterval(function () {
      window.location.reload();
  }, 50000);