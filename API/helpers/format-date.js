const formatDate = () => {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    if (mm < 10) {
        let mesSinCero = mm.split('');
        mm = mesSinCero[1];
    }
    if (dd < 10) {
        let diaSinCero = dd.split('');
        dd = diaSinCero[1];
    }
    let arrayFecha = [dd, mm, yyyy];
    return dd + '-' + mm + '-' + yyyy;
}

module.exports = { formatDate }