package com.yamu.backend;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/home")
public class HomeController {

    

    @GetMapping("/greet")
    public String greet(){
        System.out.println("I am here !");
        return "Hello World ! how are you";
    }
}
