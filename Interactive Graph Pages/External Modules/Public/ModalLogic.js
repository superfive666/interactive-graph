export function PrepareBinding(list, data) {
    list.forEach(element => {
        if($w(element.id).length === 0){
            return;
        }
        $w(element.id).text = data[element.key].toString();
    });
}