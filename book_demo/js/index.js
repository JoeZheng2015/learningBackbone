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
		initialize: function() {
			this.render();
		},
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	});

	var Todos = Backbone.Collection.extend({
		model: Todo,
		localStorage: new Backbone.LocalStorage("todos-backbone")
	});
	todos = new Todos();

	var AppView = Backbone.View.extend({
		collection: Todos,
		el: '.todoapp',
		events: {
			'keypress .new-todo': 'createOnEnter'
		},
		initialize: function() {
			this.$input = $('.new-todo');
			this.$list = $('.todo-list');

			this.listenTo(todos, 'add', this.addOne);
		},
		createOnEnter: function(e) {
			if (e.keyCode === 13 && this.$input.val()) {
				todos.create({
					title: this.$input.val()
				});
				this.$input.val('');
			}
		},
		addOne: function(model, collection, options) {
			var todoView = new TodoView({model: model});
			this.$list.append(todoView.$el);
		}
	});
	var app = new AppView();
});