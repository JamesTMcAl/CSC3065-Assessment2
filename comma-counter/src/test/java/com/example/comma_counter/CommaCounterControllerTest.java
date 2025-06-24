package com.example.comma_counter;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@SpringBootTest
@AutoConfigureMockMvc
public class CommaCounterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testCommaCount() throws Exception {
        mockMvc.perform(get("/count-commas")
                .param("text", "hello,world"))
                .andExpect(status().isOk())
                .andExpect(content().string("The number of commas is: 1"));
    }
}
