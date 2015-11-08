$(function() {
	var Todo = Backbone.Model.extend({
		// 这里不定义也可以，不过以后和Collection的create方法配合的话，需要默认的属性
		defaults: {
			title: 'todo项的标题',
			done: false
		}
	});

	var TodoList = Backbone.Collection.extend({
		// 用模型类覆盖！
		model: Todo,
		localStorage: new Backbone.LocalStorage("todos-backbone"),
		getDone: function() {
			return this.where({done: true});
		},
		getRemaining: function() {
			return this.where({done: false});
		}
	});
	var todolist = new TodoList();

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
		events: {
			'keypress #new-todo': 'create'
		},
		initialize: function () {
			this.input = $('#new-todo');
			// add事件的API为：'add'(model, collectoin, options)
			// 所以会自动把model实例传进方法里
			this.listenTo(this.collection, 'add', this.addOne);
			this.listenTo(this.collection, 'all', this.render);

			this.footer = this.$('footer');
			this.main = $('#main');

			// 自动从数据库拉取模型，然后使用set方法
			// set方法触发集合的add事件，调用addOne方法，所以内容被加载
			this.collection.fetch();
		},
		render: function () {
			// 调用集合方法，获得当前已完成和未完成todo项的数量
			var done = this.collection.getDone().length;
			var remaining = this.collection.getRemaining().length;

			if (this.collection.length) {
				this.main.show();
				this.footer.show();
				this.footer.html(this.statsTemplate({
					done: done,
					remaining: remaining
				}));
			}
			else {
				this.main.hide();
				this.footer.hide();
			}
		},
		create: function(e) {
			if (e.keyCode != 13 || !this.input.val()) {
				return false;
			}
			this.collection.add({
				title: this.input.val(),
				// 没有使用create方法，需要自己设置done属性
				done: false
			});
			this.input.val('');
		},
		addOne: function (todo) {
			var view = new TodoView({model: todo});
			// 这里取$el和el都可以，只是append是jquery对象或htmlElement对象的区别
			$("#todo-list").append(view.render().el);
		}
	});
	var app = new AppView({collection: todolist});
});