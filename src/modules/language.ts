/*
 * @Author: cijliu
 * @Date: 2020-11-18 15:54:31
 * @LastEditTime: 2020-11-18 16:51:48
 */

var dopi_language_cn = { 
    micropython_lib_install: {
        placeHolder:'例如： json',
        prompt:'输入micropython库名进行在线安装',
    }, 
    device_connect:{
        placeHolder:'例如： 192.168.137.25',
		prompt:'输入Dopi设备IP进行连接(直接回车连接默认IP: 192.168.137.25)',
    },
    message:{
        connect_successful:'连接成功',
        disconnect_successful:'断开成功',
        connect_hint:"请先进行设备连接",
        ip_format_err:'IP格式错误!',
        program_stop_hint:'请先停止正在运行的程序!',
        welcome:'欢迎使用Dopi.',
    }
};

export var locale = {
    cn:0,
    en:1
}
var dopi_language_en = { 
    micropython_lib_install: {
        placeHolder:'eg. json',
        prompt:'input micropython library name to install',
    }, 
    device_connect:{
        placeHolder:'eg： 192.168.137.25',
		prompt:'input Dopi device IP to connect(no input will connect to IP: 192.168.137.25)',
    },
    message:{
        connect_successful:'Connect Successful',
        disconnect_successful:'Disconnect Successful',
        connect_hint:'Please connect device',
        ip_format_err:'ip format error!',
        program_stop_hint:'Please stop running code!',
        welcome:'Welcome to Dopi.',
        
    }
};
export function setLanguage(type:number){
    switch(type){
    case locale.en:
        language = dopi_language_en;
        break;
    case locale.cn:
        language = dopi_language_cn;
        break;
    }
    
}
export  var language:any;

