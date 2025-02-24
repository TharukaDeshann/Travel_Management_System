package com.yamu.backend;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @RequestMapping("/home")
    public String greet(){
        System.out.println("I am here !");
        return "Hello World ! how are you";
    }
}
