$(function() {
	var state = '';

	var Todo = Backbone.Model.extend({
		defaults: {
			title: '',
			completed: false
		},
		toggle: function() {
			this.save('completed', !this.get('completed'));
		}
	});
	var TodoView = Backbone.View.extend({
		tagName: 'li',
		template: _.template($('#item-template').html()),
		events: {
			'click .destroy': 'destroy',
			// 经典
			// 在toggle这个操作上，牢记视图引起模型变化
			// 模型变化，导致视图变化这个过程
			// 统一这样的流程，就能保证render和后面的点击操作是统一逻辑
			'click .toggle': 'toggle'
		},
		initialize: function() {
			this.render();

			this.listenTo(this.model, 'destroy', this.remove);
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'visible', this.toggleVisible);
		},
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			this.$el.toggleClass('completed', this.model.get('completed'));
			return this;
		},
		destroy: function() {
			this.model.destroy();
		},
		toggle: function() {
			this.model.toggle();
		},
		toggleVisible: function() {
			this.$el.toggleClass('hidden', this.isHidden());
		},
		// 负责判断该li是否隐藏
		isHidden: function() {
			// 1.模型为已完成，过滤条件为active是返回false，过滤条件为completed时返回true
			// 2.模型为未完成，过滤条件为active是返回true，过滤条件为completed时返回false
			return this.model.get('completed') ? state === 'active' : state === 'completed';
		}
	});

	var Todos = Backbone.Collection.extend({
		model: Todo,
		localStorage: new Backbone.LocalStorage("todos-backbone"),
		completed: function() {
			return this.where({completed: true});
		},
		remaining: function() {
			return this.where({completed: false});
		}
	});
	todos = new Todos();

	var AppView = Backbone.View.extend({
		collection: todos,
		el: '.todoapp',
		template: _.template($('#stats-template').html()),
		events: {
			'keypress .new-todo': 'createOnEnter'
		},
		initialize: function() {
			this.$input = $('.new-todo');
			this.$list = $('.todo-list');
			this.$footer = $('.footer');

			this.listenTo(this.collection, 'add', this.addOne);
			this.listenTo(this.collection, 'reset', this.addAll);
			this.listenTo(this.collection, 'all', this.render);
			// 经典2
			// appView监听集合的filter事件
			// 遍历触发模型的visible事件
			// todoView监听模型的visible事件，在这里判断这个li是否显示
			this.listenTo(this.collection, 'filter', this.filter);

			this.collection.fetch();
		},
		render: function() {
			if (this.collection.length) {
				var completed = this.collection.completed().length;
				var remaining = this.collection.remaining().length;
				
				this.$footer.html(this.template({
					remaining: remaining,
					completed: completed
				}));
				this.$('.filters li a')
				    .removeClass('selected')
				    .filter('[href="#' + (state || '') + '"]')
				    .addClass('selected');

				this.$footer.show();
			}
			else {
				this.$footer.hide();
			}
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
		},
		filter: function() {
			this.collection.each(function(model, index, list) {
				model.trigger('visible');
			});
		}
	});
	var app = new AppView();

	var Router = Backbone.Router.extend({
		routes: {
			'*param': 'filter'
		},
		filter: function(param) {
			state = param ? param : '';
			todos.trigger('filter');
		}
	});
	var router = new Router();
	Backbone.history.start();
});