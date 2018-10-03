export function PrepareBinding(list, data) {
    list.forEach(element => {
        if($w(element.id)){
            $w(element.id).text = data[element.key];
        }
    });
}