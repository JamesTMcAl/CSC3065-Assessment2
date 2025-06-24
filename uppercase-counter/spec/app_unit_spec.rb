require 'minitest/autorun'
require_relative '../app' 

class TestUppercaseCounterUnit < Minitest::Test
  def setup
    @helper = Class.new { include UppercaseHelper }.new
  end

  def test_count_uppercase_all_uppercase
    result = @helper.count_uppercase('HELLO WORLD')
    assert_equal 10, result
  end

  def test_count_uppercase_mixed_case
    result = @helper.count_uppercase('Hello World')
    assert_equal 2, result
  end

  def test_count_uppercase_no_uppercase
    result = @helper.count_uppercase('hello world')
    assert_equal 0, result
  end

  def test_count_uppercase_empty_string
    result = @helper.count_uppercase('')
    assert_equal 0, result
  end

  def test_count_uppercase_special_characters
    result = @helper.count_uppercase('Hello@123')
    assert_equal 1, result
  end
end
