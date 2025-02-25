// tshirtConfig.js

// Configuration for various clothing variants
var tshirtConfigs = {
    "half_sleeve_black": {
      clothingType: "full_sleeve",
      color: "black",
      sections: {
        front: {
           baseImage: "/static/images/Black_tshirt_1.png",
           designatedArea: { top: "20%", left: "27%", width: "45%", height: "75%" },
           uploadEndpoint: "/upload/front/"
        },
        back: {
           baseImage: "/static/images/Black_tshirt_2.png",
           designatedArea: { top: "8%", left: "28%", width: "45%", height: "85%" },
           uploadEndpoint: "/upload/back/"
        },
        left: {
           baseImage: "/static/images/Black_tshirt_3.png",
           designatedArea: { top: "20%", left: "45%", width: "14%", height: "15%" },
           uploadEndpoint: "/upload/left-sleeve/"
        },
        right: {
           baseImage: "/static/images/Black_tshirt_4.png",
           designatedArea: { top: "20%", left: "40%", width: "14%", height: "15%" },
           uploadEndpoint: "/upload/right-sleeve/"
        }
      }
    },
    "half_sleeve_white": {
      clothingType: "full_sleeve",
      color: "white",
      sections: {
        front: {
           baseImage: "/static/images/white_tshirt_1.png",
           designatedArea: { top: "20%", left: "27%", width: "45%", height: "75%" },
           uploadEndpoint: "/upload/front/"
        },
        back: {
           baseImage: "/static/images/white_tshirt_2.png",
           designatedArea: { top: "8%", left: "28%", width: "45%", height: "85%" },
           uploadEndpoint: "/upload/back/"
        },
        leftSleeve: {
           baseImage: "/static/images/white_tshirt_3.png",
           designatedArea: { top: "20%", left: "45%", width: "14%", height: "15%" },
           uploadEndpoint: "/upload/left-sleeve/"
        },
        rightSleeve: {
           baseImage: "/static/images/white_tshirt_4.png",
           designatedArea: { top: "20%", left: "40%", width: "14%", height: "15%" },
           uploadEndpoint: "/upload/right-sleeve/"
        }
      }
    }
    // Future clothing types can be added here...
  };
  