/* tshirtConfig.js */

const tshirtConfigs = {
    "half_sleeve": {
      "black": {
        clothingType: "half_sleeve",
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
          leftSleeve: {
             baseImage: "/static/images/Black_tshirt_3.png",
             designatedArea: { top: "20%", left: "45%", width: "14%", height: "15%" },
             uploadEndpoint: "/upload/left-sleeve/"
          },
          rightSleeve: {
             baseImage: "/static/images/Black_tshirt_4.png",
             designatedArea: { top: "20%", left: "40%", width: "14%", height: "15%" },
             uploadEndpoint: "/upload/right-sleeve/"
          }
        }
      },
      "white": {
        clothingType: "half_sleeve",
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
      // You can add more colours for half_sleeve here...
    },
    "full_sleeve": {
      "blue": {
        clothingType: "full_sleeve",
        color: "blue",
        sections: {
          front: {
             baseImage: "/static/images/Blue_fullsleeve_1.png",
             designatedArea: { top: "22%", left: "25%", width: "50%", height: "70%" },
             uploadEndpoint: "/upload/front/"
          },
          back: {
             baseImage: "/static/images/Blue_fullsleeve_2.png",
             designatedArea: { top: "10%", left: "27%", width: "50%", height: "80%" },
             uploadEndpoint: "/upload/back/"
          },
          leftSleeve: {
             baseImage: "/static/images/Blue_fullsleeve_3.png",
             designatedArea: { top: "20%", left: "50%", width: "12%", height: "15%" },
             uploadEndpoint: "/upload/left-sleeve/"
          },
          rightSleeve: {
             baseImage: "/static/images/Blue_fullsleeve_4.png",
             designatedArea: { top: "20%", left: "38%", width: "12%", height: "15%" },
             uploadEndpoint: "/upload/right-sleeve/"
          }
        }
      }
      // Add more colours for full_sleeve here...
    }
    // Future clothing styles (oversized, sleeveless, etc.) can be added here...
  };
  