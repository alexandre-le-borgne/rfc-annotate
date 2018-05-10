var $popover = $('<div id="rfc-annotate-popover"></div>')
    .append($('<div class="arrow"></div>'))
    .append(
        $('<ul></ul>')
            .append('<li class="remove">Supprimer</li>')
            .append('<li class="ignored">Ignoré</li>')
            .append('<li class="done">Fait</li>')
            .append('<li class="todo">A faire</li>')
    );

function getDomPath(el) {
    var stack = [];
    while (el.parentNode != null) {
        console.log(el.nodeName);
        var sibCount = 0;
        var sibIndex = 0;
        for (var i = 0; i < el.parentNode.childNodes.length; i++) {
            var sib = el.parentNode.childNodes[i];
            if (sib.nodeName === el.nodeName) {
                if (sib === el) {
                    sibIndex = sibCount;
                }
                sibCount++;
            }
        }
        if (el.hasAttribute('id') && el.id !== '') {
            stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
        } else if (sibCount > 1) {
            stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
        } else {
            stack.unshift(el.nodeName.toLowerCase());
        }
        el = el.parentNode;
    }
    return stack.slice(1); // removes the html element
}

function save() {
    var data = {};
    $('.rfc-annotate-annotation').each(function () {
        var $parent = $(this).parent();
        data[getDomPath($parent.get(0)).join(' ')] = $parent.html()
    });
    console.info('save');
    console.log(data);

    chrome.storage.local.set({annotations: data});
}

// Todo load & save from external
function load() {
    chrome.storage.local.get('annotations', function (result) {
        if(typeof result.annotations === 'undefined') {
            return;
        }

        console.info('load');
        console.log(result);

        result = result.annotations;
        for (var path in result) {
            if (!result.hasOwnProperty(path)) {
                continue;
            }
            $(path).html(result[path])
        }
    });
}

$(function () {
    load();
    $('body').append($popover);

    $popover.find('.remove').click(function () {
        var $annotation = $popover.data('annotation');
        console.log($annotation);
        $annotation.after($annotation.html()).remove();
        $popover.hide();
        console.log('remove');
        save()
    });

    $popover.find('.ignored').click(function () {
        var $annotation = $popover.data('annotation');

        $annotation.attr('data-status', 'ignored').removeClass('active');
        $popover.hide();
        save()
    });

    $popover.find('.todo').click(function () {
        var $annotation = $popover.data('annotation');

        $annotation.attr('data-status', 'todo').removeClass('active');
        $popover.hide();
        save()
    });

    $popover.find('.done').click(function () {
        var $annotation = $popover.data('annotation');

        $annotation.attr('data-status', 'done').removeClass('active');
        $popover.hide();
        save()
    });

    $(document)
        .on('click', '.content', function (e) {
            if ($(e.target).closest('.rfc-annotate-annotation').length > 0) {
                console.log('1')
                return;
            }
            var selection = window.getSelection();
            var $span = $('<span class="rfc-annotate-annotation rfc-annotate-annotation"></span>').attr('data-status', 'ignored');
            var span = $span.get(0);
            var range = selection.getRangeAt(0);
            if (range.toString().length === 0) {
                return;
            }

            // range.surroundContents(spn);
            span.appendChild(range.extractContents());
            range.insertNode(span);
            $(span).find('.rfc-annotate-annotation').each(function () {
                var $annotation = $(this)
                console.warn('remove')
                console.log($annotation)
                $annotation.after($annotation.html()).remove()
            }).trigger('click')
            save()
        })
        .on('click', '.rfc-annotate-annotation', function (e) {
            // console.log(e)
            console.log('a')
            $(this).addClass('active');
            $popover
                .css('left', e.pageX + 'px')
                .css('top', e.pageY + 'px').show()
                .data('annotation', $(this));
            e.stopPropagation()
        });

    $(document).on('click', function (e) {
        if ($popover.is(":visible") && !$popover.get(0).contains(e.target)) {
            $popover.hide()
            $('.rfc-annotate-annotation.active').removeClass('active')
        }
    });


});
