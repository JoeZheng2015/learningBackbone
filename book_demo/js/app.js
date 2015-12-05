$(function() {
    var ob = {};
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
        template: _.template($('#item-template').html()),
        tagName: 'li',
        events: {
            'click .destroy': 'clear',
            'click .toggle': 'toggle'
        },
        toggleVisible: function() {
            this.$el.toggleClass('hidden', this.isHidden());
        },
        isHidden: function() {
            // 如果是已完成的，状态为active则返回true，即显示
            return this.model.get('completed') ? ob.filter === 'active' : ob.filter === 'completed';
        },
        toggle: function() {
            this.model.toggle();
        },
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'visible', this.toggleVisible);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            // 视图的是否加删除线的更新在视图上监听change事件
            this.$el.toggleClass('completed', this.model.get('completed'));
            return this;
        },
        clear: function() {
            this.model.destroy();
        }
    });

    var Todos = Backbone.Collection.extend({
        model: Todo,
        localStorage: new Backbone.LocalStorage("todos-backbone"),
        initialize: function() {
        },
        completed: function() {
            return this.where({completed: true});
        },
        remaining: function() {
            return this.where({completed: false});
        }
    });
    todos = new Todos();

    var AppView = Backbone.View.extend({
        el: '.todoapp',
        collection: Todos,
        input: $('.new-todo'),
        statsTemplate: _.template($('#stats-template').html()),
        initialize: function() {
            this.allCheckbox = this.$('.toggle-all')[0];
            this.$input = this.$('.new-todo');
            this.$footer = this.$('.footer');
            this.$main = this.$('.main');
            this.$list = $('.todo-list');

            this.listenTo(todos, 'add', this.addOne);
            this.listenTo(todos, 'reset', this.addAll);
            this.listenTo(todos, 'all', this.render);

            this.listenTo(todos, 'filter', this.filterAll);

            todos.fetch();
        },
        filterOne: function(todo) {
            todo.trigger('visible');
        },
        filterAll: function() {
            todos.each(this.filterOne, this);
        },
        render: function() {
            var completed = todos.completed().length;
            var remaining = todos.remaining().length;
            if (todos.length) {
                this.$main.show();
                this.$footer.show();

                this.$footer.html(this.statsTemplate({
                    completed: completed,
                    remaining: remaining
                }));

                this.$('.filters li a')
                    .removeClass('selected')
                    .filter('[href="#/' + (ob.filter || '') + '"]')
                    .addClass('selected');
            } else {
                this.$main.hide();
                this.$footer.hide();
            }

            this.allCheckbox.checked = !remaining;
        },
        events: {
            'keypress .new-todo': 'createOnEnter',
        },
        addOne: function(todo) {
            var todoView = new TodoView({model: todo});
            this.$('.todo-list').append(todoView.render().el);
        },
        addAll: function() {
            this.collection.each(this.addOne, this);
        },
        createOnEnter: function(e) {
            var text = this.input.val();
            if (e.keyCode === 13 && text) {
                todos.create({
                    title: text
                });
                this.input.val('');
            }
        }
    });

    var Router = Backbone.Router.extend({
        routes: {
            '*filter': 'setFilter'
        },
        setFilter: function(param) {
            ob.filter = param || '';
            todos.trigger('filter');
        }
    });
    var router = new Router();
    Backbone.history.start();

    var app = new AppView();
});