var app = app || {};

app.LibraryView = Backbone.View.extend({
    el: '#books',
    events: {
        'click #add': 'addBook'
    },
    initialize: function(initialBooks) {
        this.collection = new app.Library(initialBooks);
        this.render();

        this.listenTo(this.collection, 'add', this.renderBook);
    },
    render: function() {
        this.collection.each(function(item) {
            this.renderBook(item);
        }, this);
    },
    renderBook: function(item) {
        var bookView = new app.BookView({
            model: item
        });
        this.$el.append(bookView.render().el);
    },
    addBook: function(e) {
        e.preventDefault();
        var model = {};
        $.each($('#addBook input'), function(index, el) {
            var $el = $(el);
            if ($el.val() !== '') {
                model[$el[0].id] = $el.val();
            }
        });
        this.collection.add(new app.Book(model));
    }
});