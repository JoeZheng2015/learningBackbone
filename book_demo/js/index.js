$(function() {
	var Todo = Backbone.Model.extend({
		defaults: {
			title: '',
			completed: false
		}
	});
	var TodoView = Backbone.View.extend({
		tagName: 'li',
		template: _.template($('#item-template').html()),
		events: {
			'click .destroy': 'destroy'
		},
		initialize: function() {
			this.render();

			this.listenTo(this.model, 'destroy', this.remove);
		},
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},
		destroy: function() {
			this.model.destroy();
		}
	});

	var Todos = Backbone.Collection.extend({
		model: Todo,
		localStorage: new Backbone.LocalStorage("todos-backbone")
	});
	todos = new Todos();

	var AppView = Backbone.View.extend({
		collection: todos,
		el: '.todoapp',
		events: {
			'keypress .new-todo': 'createOnEnter'
		},
		initialize: function() {
			this.$input = $('.new-todo');
			this.$list = $('.todo-list');

			this.listenTo(this.collection, 'add', this.addOne);
			this.listenTo(this.collection, 'reset', this.addAll);

			this.collection.fetch();
		},
		createOnEnter: function(e) {
			var text = this.$input.val();
			if (e.keyCode === 13 && text) {
				this.collection.create({
					title: text
				});
				this.$input.val('');
			}
		},
		addOne: function(model, collection, options) {
			var todoView = new TodoView({model: model});
			this.$list.append(todoView.$el);
		},
		addAll: function(collection, options) {
			collection.each(this.addOne, this);
		}
	});
	var app = new AppView();
});