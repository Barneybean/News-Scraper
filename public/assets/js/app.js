$.get("/", function (result) {
  console.log("loaded");
  console.log(result);
  // $(".article-container").html()
})

$.get("/saved", function (data) {
  console.log("data",data)
})

// Grab the articles as a json
$("#scrapeBtn").on("click", function () {
  $.get("/scrape", function(result) {

  });
})

$(".save").on("click", function() {
  var id = $(this).attr("data-id");

  $.post("/api/saved", {id: id}, function (result) {
    console.log(result);
  })
  $(this).text("Saved!");
  $(this).removeClass("save");
});

$(".delete").on("click", function () {
  var id = $(this).attr("data-id");

  $.ajax("/api/delete/"+id, {
    type: "DELETE"
  }).then(function (result) {
    console.log("deleted", result);
    location.reload();
  });

})
//when add note button is clicked triger modal and get notes from db assoc with this article id
$(".addNote").on("click", function () {
  $('#centralModalSuccess').modal('toggle');
  const articleId = $(this).attr("data-id");
  console.log(articleId);

  $(".noteSubmit").attr("data-id", articleId);
  $(".allNote").empty();

  $.get("/api/allnotes/" + articleId, function(dbNote) {
    console.log("note", dbNote);
    for(let i=0; i<dbNote.length; i++) {
      var noteBody = $(`<li>${dbNote[i].body}<span data-id=${dbNote[i]._id}>&times;</span></li>`);
      // noteBody.text(dbNote[i].body);
      $(".allNote").append(noteBody);
    }
  })

})

// When you click the savenote button
$(".noteSubmit").on("click", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/api/articles/" + thisId,
    data: {
      body: $(".newNote").val().trim()
    }
  })
  // With that done
  .then(function(data) {
    // Log the response
    console.log(data);
  });

  $(".newNote").empty();
});
