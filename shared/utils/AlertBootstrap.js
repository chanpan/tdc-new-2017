exports.AlertSuccess=function(title="Success!", msg){
    return `
        <div class="alert alert-success alert-dismissable fade in">
            <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
            <strong>${title}</strong> ${msg}
        </div>
    `;
}
exports.AlertInfo=function(title="Info!", msg){
    return `
        <div class="alert alert-info alert-dismissable fade in">
            <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
            <strong>${title}</strong> ${msg}
        </div>
    `;
}
exports.AlertWarning=function(title="Warning!", msg){
    return `
        <div class="alert alert-warning alert-dismissable fade in">
            <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
            <strong>${title}</strong> ${msg}
        </div>
    `;
}
exports.AlertDanger=function(title="Success!", msg){
    return `
        <div class="alert alert-danger alert-dismissable fade in">
            <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
            <strong>${title}</strong> ${msg}
        </div>
    `;
}
 