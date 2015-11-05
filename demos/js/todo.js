$(function() {
	var Todo = Backbone.Model.extend({
		defaults: {
			title: 'empty',
			done: false
		}
	});
	var TodoList = Backbone.Collection.extend({
		model: Todo,
		comparator: 'order'
	});
	var todo1 = new Todo({
		title: '标题1',
		done: false
	});
	var todo2 = new Todo({
		title: '标题2',
		done: true
	});
	var Todos = new TodoList([todo1, todo2]);

	var TodoView = Backbone.View.extend({
		tagName: 'li',
		template: _.template($('#item-template').html()),
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	});

	var AppView = Backbone.View.extend({
		el: $('#todoapp'),
		statsTemplate: _.template($('#stats-template').html()),
		initialize: function() {
			this.addAll();
		},
		addOne: function(todo) {
			var view = new TodoView({model: todo});
			this.$('#todo-list').append(view.render().el);
		},
		addAll: function() {
			Todos.each(this.addOne, this);
		}
	});

	var App = new AppView;
});