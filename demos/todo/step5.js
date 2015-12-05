$(function() {
    var state = {};
    var Todo = Backbone.Model.extend({
        // 这里不定义也可以，不过以后和Collection的create方法配合的话，需要默认的属性
        defaults: {
            title: 'todo项的标题',
            done: false
        },
        toggle: function () {
            // 如果只是单纯的用set方法，只会在本地起效
            // 使用save则会保存到数据库，然后触发'change'事件
            // 所以我们可以在change事件中定义本地的改变
            this.save({done: !this.get('done')});
        }
    });

    var TodoList = Backbone.Collection.extend({
        model: Todo,
        localStorage: new Backbone.LocalStorage("todos-backbone"),
        getDone: function() {
            return this.where({done: true});
        },
        getRemaining: function() {
            return this.where({done: false});
        }
    });
    todolist = new TodoList();

    var TodoView = Backbone.View.extend({
        tagName: 'li',
        template: _.template($('#item-template').html()),
        events: {
            'click .toggle': 'toggleDone',
            'click a.destroy': 'clear',
            'dblclick .view': 'edit',
            "blur .edit"      : "close"
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            // 但model触发destory事件时，调用视图的remove方法，从DOM中移除对应视图
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'visible', this.toggleVisible);
        },
        toggleVisible: function() {
            this.$el.toggleClass('hidden', this.isHidden());
        },
        isHidden: function() {
            return this.model.get('done') ? state === 'active' : state === 'completed';
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.toggleClass('done', this.model.get('done'));
            this.input = this.$('.edit');
            return this;
        },
        toggleDone: function() {
            // 因为在实例化app的时候，已经把todo传进来作为这个view的model
            this.model.toggle();
        },
        clear: function() {
            this.model.destroy();
        },
        edit: function() {
            this.$el.addClass("editing");
        },
        close: function() {
            // 生成html后，绑定this.input就能存储每个view下的input
            var value = this.input.val();
            if (!value) {
                this.clear();
            }
            else {
                // 使用save在更新model
                this.model.save({title: value});
                this.$el.removeClass('editing');
            }
        }
    });

    var AppView = Backbone.View.extend({
        el: $('#todoapp'),
        statsTemplate: _.template($('#stats-template').html()),
        events: {
            'keypress #new-todo': 'create',
            'click #toggle-all': 'toggleAll',
            'click #clear-completed': 'clear'
        },
        initialize: function () {
            this.input = $('#new-todo');
            this.allCheckbox = this.$("#toggle-all")[0];
            // add事件的API为：'add'(model, collectoin, options)
            // 所以会自动把model实例传进方法里
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'all', this.render);
            this.listenTo(this.collection, 'filter', this.filterAll);

            this.footer = this.$('footer');
            this.main = $('#main');

            // 自动从数据库拉取模型，然后使用set方法
            // set方法触发集合的add事件，调用addOne方法，所以内容被加载
            this.collection.fetch();
        },
        filterAll: function() {
            this.collection.each(this.filterOne, this);
        },
        filterOne: function(todo) {
            todo.trigger('visible');
        },
        render: function () {
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
            this.allCheckbox.checked = !remaining;
        },
        create: function(e) {
            if (e.keyCode != 13 || !this.input.val()) {
                return false;
            }
            this.collection.create({
                title: this.input.val()
            });
            this.input.val('');
        },
        addOne: function (todo) {
            var view = new TodoView({model: todo});
            // 这里取$el和el都可以，只是append是jquery对象或htmlElement对象的区别
            $("#todo-list").append(view.render().el);
        },
        toggleAll: function () {
            // 获取点击全选之后的按钮的状态
            // 所有li的按钮也同步
            var done = this.allCheckbox.checked;
            this.collection.each(function (todo) {
                todo.save({
                    done: done
                });
            });
        },
        clear: function () {
            var done = this.collection.getDone();
            // 调用model上的destroy方法，通过detele删除数据库上的模型，并触发model上的destroy事件
            _.invoke(done, 'destroy');
            return false;
        }
    });
    var Router = Backbone.Router.extend({
        routes: {
            '*filter': 'setFilter'
        },
        setFilter: function(param) {
            state = param || '';
            todolist.trigger('filter');
        }
    });
    var router = new Router();
    Backbone.history.start();
    var app = new AppView({collection: todolist});
});