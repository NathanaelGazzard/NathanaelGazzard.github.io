document.addEventListener("DOMContentLoaded", function () {
    let slideIndex = 0;
    showSlides();
  
    function showSlides() {
      let i;
      let slides = document.getElementsByClassName("mySlides");
      for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }
      slideIndex++;
      if (slideIndex > slides.length) {
        slideIndex = 1;
      }
      slides[slideIndex - 1].style.display = "block";
  
      // Set random values for --move-vert and --move-hor
      slides[slideIndex - 1].style.setProperty('--move-vert', getRndInteger(-5, 5) + '%');
      slides[slideIndex - 1].style.setProperty('--move-hor', getRndInteger(-5, 5) + '%');
      
      setTimeout(showSlides, 5000);
    }
  });
  
  function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  