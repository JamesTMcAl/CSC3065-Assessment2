class UppercaseCounter
    def self.count_uppercase(input)
      raise ArgumentError, "Input must be a string" unless input.is_a?(String)
  
      input.count("A-Z")
    end
  end
  