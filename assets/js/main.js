var app = angular.module("droid", []);
app.controller("main.controller", function($scope, $http) {
  $scope.dates = [];
  $scope.filtered_by_months = [];
  $scope.loaded= false;
  //initialize months in a year
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  //arrays and objects
  $scope.data_positive = {};
  $scope.data_negative = {};
  $scope.array_pos = [];
  $scope.array_neg = [];
  $scope.top_src = {};
  $scope.top_dest = {};
  $scope.sortable = [];
  $scope.sort_src = [];
  $scope.sort_dest = [];
  $scope.delay_count = {};

  //http service to fetch the data from the API.
  $http({
    method: 'GET',
    url: 'https://asia-east2-greentoad-bfbb7.cloudfunctions.net/apiIndia/api/angular'
  }).then(function successCallback(response) {
    $scope.data = response.data;
    //looping response array list
    for (var i = 0; i < $scope.data.length; i++) {
      //temporary variables
      var month = monthNames[new Date($scope.data[i].trip_start_time).getMonth()];
      var delay = $scope.data[i].delay;
      var source = $scope.data[i].srcname;
      var desti = $scope.data[i].destname;
      if (delay > 0) {
        //Extracting positive delays
        $scope.extract_delays(month, $scope.data_positive);
      } else {
        //Extracting negative delays
        $scope.extract_delays(month, $scope.data_negative);
      }
      //preparing top source and destination data
      $scope.top_cities(source, $scope.top_src);
      $scope.top_cities(desti, $scope.top_dest);
    }
    //sorting top source and destination in descending order
    $scope.find_max($scope.top_src, $scope.sort_src);
    $scope.find_max($scope.top_dest, $scope.sort_dest);
    for (var i = 0; i < monthNames.length; i++) {
      //removing key for chart data
      $scope.prepare_chart_data(monthNames[i],$scope.data_positive,$scope.array_pos,i);
      $scope.prepare_chart_data(monthNames[i],$scope.data_negative,$scope.array_neg,i);
    }
    $scope.draw_chart($scope.array_pos, $scope.array_neg);
    $scope.loaded=true;
  }, function errorCallback(response) {
    document.write('<h1 style="text-align:center">Something was not Found Error:404!!</h1>');
  });

  $scope.find_max = function(sort_object, sort_array) {
    for (source in sort_object) {
      sort_array.push([source, sort_object[source]]);
    }
    sort_array.sort(function(a, b) {
      return b[1] - a[1];
    });
  }

  $scope.extract_delays = function(month, delay_count) {
    if (month in delay_count) {
      delay_count[month] = delay_count[month] + 1
    } else {
      delay_count[month] = 1;
    }
  }

  $scope.top_cities = function(city, top_list) {
    if (city in top_list) {
      top_list[city] = top_list[city] + 1
    } else {
      top_list[city] = 1;
    }
  }

  $scope.prepare_chart_data = function(month_name,data_object, array_obj,i) {
    if (month_name in data_object) {
      array_obj[i] = data_object[month_name]
    } else {
      array_obj[i] = 0;
    }
  }

  $scope.draw_chart = function(pos, neg) {
    var bar_ctx = document.getElementById('bar-chart');
    var bar_chart = new Chart(bar_ctx, {
      type: 'bar',
      data: {
        labels: monthNames,
        datasets: [{
            label: 'Delay <= 0',
            data: neg,
            backgroundColor: "#76e34a",
            hoverBackgroundColor: "#51e639",
            hoverBorderWidth: 0
          },
          {
            label: 'Delay > 0',
            data: pos,
            backgroundColor: "#f09440",
            hoverBackgroundColor: "#fac45a",
            hoverBorderWidth: 0
          },
        ]
      },
      options: {
        animation: {
          duration: 10,
        },
        tooltips: {
          mode: 'label',
        },
        scales: {
          xAxes: [{
            stacked: true,
            barPercentage: 0.4,
            gridLines: {
              display: false
            },
          }],
          yAxes: [{
            stacked: true,

          }],
        },
        legend: {
          display: true
        },
        title: {
          display: true,
          text: 'Delay Report'
        }
      }
    })
  };

});
