/**
 * Bulk Java Question Inserter
 * Inserts topic-wise MCQ questions into the Java quiz for instructor Thulasi.
 * Run: node scripts/bulk_java_questions.js
 */
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// ─── Question Bank ────────────────────────────────────────────────────────────
const TOPICS = [
  {
    topic: 'Basics',
    questions: [
      // Easy
      { question_text: 'Which keyword is used to define a class in Java?', option_a: 'define', option_b: 'class', option_c: 'struct', option_d: 'object', correct_option: 'b' },
      { question_text: 'What is the default value of an int variable in Java?', option_a: 'null', option_b: '1', option_c: '0', option_d: 'undefined', correct_option: 'c' },
      { question_text: 'Which method is the entry point of a Java program?', option_a: 'start()', option_b: 'init()', option_c: 'run()', option_d: 'main()', correct_option: 'd' },
      { question_text: 'Which of the following is NOT a primitive data type in Java?', option_a: 'int', option_b: 'boolean', option_c: 'String', option_d: 'char', correct_option: 'c' },
      { question_text: 'What does JVM stand for?', option_a: 'Java Virtual Memory', option_b: 'Java Visual Machine', option_c: 'Java Virtual Machine', option_d: 'Java Variable Model', correct_option: 'c' },
      // Medium
      { question_text: 'What is the size of a long data type in Java?', option_a: '32 bits', option_b: '16 bits', option_c: '64 bits', option_d: '128 bits', correct_option: 'c' },
      { question_text: 'Which operator is used for integer division in Java?', option_a: '//', option_b: '%', option_c: '/', option_d: 'div', correct_option: 'c' },
      { question_text: 'What is the output of: System.out.println(10 % 3)?', option_a: '3', option_b: '1', option_c: '0', option_d: '2', correct_option: 'b' },
      { question_text: 'Which access modifier makes a member accessible only within the same class?', option_a: 'protected', option_b: 'default', option_c: 'public', option_d: 'private', correct_option: 'd' },
      { question_text: 'What is autoboxing in Java?', option_a: 'Converting double to int', option_b: 'Automatic conversion of primitive to wrapper class', option_c: 'Casting between classes', option_d: 'Memory allocation', correct_option: 'b' },
      // Hard
      { question_text: 'What is the output of: System.out.println(1 + 2 + "3")?', option_a: '123', option_b: '6', option_c: '33', option_d: 'Error', correct_option: 'c' },
      { question_text: 'Which of these statements about Java is FALSE?', option_a: 'Java is platform independent', option_b: 'Java supports multiple inheritance through classes', option_c: 'Java is object-oriented', option_d: 'Java uses garbage collection', correct_option: 'b' },
      { question_text: 'What is the result of (byte)(127 + 1) in Java?', option_a: '128', option_b: '0', option_c: '-128', option_d: 'Compilation error', correct_option: 'c' },
    ],
  },
  {
    topic: 'Control Statements',
    questions: [
      // Easy
      { question_text: 'Which keyword exits a switch case block?', option_a: 'exit', option_b: 'stop', option_c: 'break', option_d: 'return', correct_option: 'c' },
      { question_text: 'Which loop checks the condition AFTER executing the body?', option_a: 'for', option_b: 'while', option_c: 'do-while', option_d: 'foreach', correct_option: 'c' },
      { question_text: 'Which statement is used to skip the current iteration of a loop?', option_a: 'break', option_b: 'skip', option_c: 'pass', option_d: 'continue', correct_option: 'd' },
      { question_text: 'What is the output of: for(int i=0;i<3;i++) System.out.print(i+" ");', option_a: '1 2 3', option_b: '0 1 2', option_c: '0 1 2 3', option_d: '1 2', correct_option: 'b' },
      { question_text: 'Which keyword starts a conditional block in Java?', option_a: 'when', option_b: 'check', option_c: 'if', option_d: 'switch', correct_option: 'c' },
      // Medium
      { question_text: 'How many times does the loop execute: for(int i=5;i>0;i--)?', option_a: '4', option_b: '6', option_c: '5', option_d: 'Infinite', correct_option: 'c' },
      { question_text: 'What is a labeled break used for in Java?', option_a: 'Break multiple nested loops', option_b: 'Exit only the inner loop', option_c: 'Return a value', option_d: 'Skip an iteration', correct_option: 'a' },
      { question_text: 'In a switch statement, what happens if no case matches and there is no default?', option_a: 'Exception is thrown', option_b: 'First case executes', option_c: 'Nothing happens', option_d: 'Compile error', correct_option: 'c' },
      { question_text: 'Which of these is a valid enhanced for loop in Java?', option_a: 'for(int i : array)', option_b: 'for each(int i in array)', option_c: 'foreach(int i : array)', option_d: 'for(array : int i)', correct_option: 'a' },
      { question_text: 'What will be the output of: int x = 5; System.out.println(x > 3 ? "Yes" : "No");', option_a: 'No', option_b: 'Yes', option_c: 'Error', option_d: 'null', correct_option: 'b' },
      // Hard
      { question_text: 'What is fall-through behavior in a switch statement?', option_a: 'Execution continues to the next case after a match', option_b: 'The program crashes', option_c: 'The JVM skips to default', option_d: 'All cases execute simultaneously', correct_option: 'a' },
      { question_text: 'Which Java 14+ feature allows switch to return a value?', option_a: 'switch expression with yield', option_b: 'switch with return keyword', option_c: 'switch-case-value', option_d: 'switch lambda', correct_option: 'a' },
      { question_text: 'What is the output: int i=0; while(i++<3) System.out.print(i+" ");', option_a: '0 1 2', option_b: '1 2 3', option_c: '0 1 2 3', option_d: '1 2 3 4', correct_option: 'b' },
    ],
  },
  {
    topic: 'Arrays',
    questions: [
      // Easy
      { question_text: 'How do you declare an integer array in Java?', option_a: 'int[] arr;', option_b: 'array int arr;', option_c: 'int arr[];', option_d: 'Both A and C', correct_option: 'd' },
      { question_text: 'What is the index of the first element in a Java array?', option_a: '1', option_b: '-1', option_c: '0', option_d: 'Depends on the array', correct_option: 'c' },
      { question_text: 'How do you find the length of an array arr?', option_a: 'arr.size()', option_b: 'arr.length', option_c: 'length(arr)', option_d: 'arr.count()', correct_option: 'b' },
      { question_text: 'What exception is thrown when accessing arr[-1]?', option_a: 'NullPointerException', option_b: 'IndexOutOfBoundsException', option_c: 'ArrayIndexOutOfBoundsException', option_d: 'IllegalArgumentException', correct_option: 'c' },
      { question_text: 'What is the default value of an integer array element in Java?', option_a: 'null', option_b: '1', option_c: '-1', option_d: '0', correct_option: 'd' },
      // Medium
      { question_text: 'How do you sort an array in Java using the standard library?', option_a: 'Array.sort(arr)', option_b: 'Arrays.sort(arr)', option_c: 'arr.sort()', option_d: 'Collections.sort(arr)', correct_option: 'b' },
      { question_text: 'What does System.arraycopy(src,0,dst,0,n) do?', option_a: 'Compares two arrays', option_b: 'Fills an array with values', option_c: 'Copies n elements from src to dst', option_d: 'Reverses an array', correct_option: 'c' },
      { question_text: 'Which of the following creates a 2D array in Java?', option_a: 'int arr[][] = new int[3][3];', option_b: 'int arr = new int[3,3];', option_c: 'int[] arr = new int[3][3];', option_d: 'int arr(3)(3);', correct_option: 'a' },
      { question_text: 'What is a jagged array in Java?', option_a: 'An array with null elements', option_b: 'An array where each row can have different lengths', option_c: 'A sorted array', option_d: 'An array of strings', correct_option: 'b' },
      { question_text: 'What is the time complexity of binary search on a sorted array?', option_a: 'O(n)', option_b: 'O(n^2)', option_c: 'O(log n)', option_d: 'O(1)', correct_option: 'c' },
      // Hard
      { question_text: 'What does Arrays.asList() return?', option_a: 'An ArrayList', option_b: 'A fixed-size list backed by the array', option_c: 'A LinkedList', option_d: 'A HashSet', correct_option: 'b' },
      { question_text: 'What is the output: int[] a={1,2,3}; int[] b=a; b[0]=9; System.out.println(a[0]);', option_a: '1', option_b: '9', option_c: 'Error', option_d: 'null', correct_option: 'b' },
      { question_text: 'Which algorithm does Arrays.sort() use for primitive arrays in Java?', option_a: 'Merge Sort', option_b: 'Heap Sort', option_c: 'Quicksort (Dual-Pivot)', option_d: 'Bubble Sort', correct_option: 'c' },
    ],
  },
  {
    topic: 'Strings',
    questions: [
      // Easy
      { question_text: 'Are Java Strings mutable?', option_a: 'Yes', option_b: 'No, they are immutable', option_c: 'Only in Java 8+', option_d: 'Depends on the JVM', correct_option: 'b' },
      { question_text: 'Which method returns the number of characters in a String?', option_a: 'size()', option_b: 'count()', option_c: 'length()', option_d: 'charAt()', correct_option: 'c' },
      { question_text: 'What does str.toUpperCase() do?', option_a: 'Converts first letter to uppercase', option_b: 'Converts all characters to uppercase', option_c: 'Trims whitespace', option_d: 'Reverses the string', correct_option: 'b' },
      { question_text: 'Which class provides a mutable sequence of characters?', option_a: 'String', option_b: 'StringWrapper', option_c: 'StringBuilder', option_d: 'CharArray', correct_option: 'c' },
      { question_text: 'How do you compare two strings for equality in Java?', option_a: 'str1 == str2', option_b: 'str1.equals(str2)', option_c: 'str1.compare(str2)', option_d: 'String.equals(str1, str2)', correct_option: 'b' },
      // Medium
      { question_text: 'What is the difference between String and StringBuilder?', option_a: 'No difference', option_b: 'String is mutable, StringBuilder is not', option_c: 'String is immutable, StringBuilder is mutable', option_d: 'StringBuilder is slower', correct_option: 'c' },
      { question_text: 'What does str.substring(2, 5) return for "Hello"?', option_a: '"ell"', option_b: '"ello"', option_c: '"He"', option_d: '"llo"', correct_option: 'a' },
      { question_text: 'Which method splits a string around a delimiter?', option_a: 'parse()', option_b: 'split()', option_c: 'tokenize()', option_d: 'separate()', correct_option: 'b' },
      { question_text: 'What is String interning?', option_a: 'Storing strings in heap memory', option_b: 'Reusing string literals from the string pool', option_c: 'Encrypting a string', option_d: 'Serializing a string', correct_option: 'b' },
      { question_text: 'What does String.format("%d + %d = %d", 1, 2, 3) return?', option_a: '1 + 2 = 3', option_b: '%d + %d = %d', option_c: '123', option_d: 'Error', correct_option: 'a' },
      // Hard
      { question_text: 'What is the output: String a="Hello"; String b="Hello"; System.out.println(a==b);', option_a: 'false', option_b: 'true', option_c: 'Error', option_d: 'null', correct_option: 'b' },
      { question_text: 'What is the time complexity of String concatenation in a loop using "+" operator?', option_a: 'O(n)', option_b: 'O(log n)', option_c: 'O(n^2)', option_d: 'O(1)', correct_option: 'c' },
      { question_text: 'Which method of StringBuilder is thread-safe?', option_a: 'StringBuilder is thread-safe', option_b: 'StringBuffer is thread-safe instead', option_c: 'Both are thread-safe', option_d: 'Neither is thread-safe', correct_option: 'b' },
    ],
  },
  {
    topic: 'OOP Concepts',
    questions: [
      // Easy
      { question_text: 'What are the four pillars of OOP?', option_a: 'Encapsulation, Abstraction, Inheritance, Polymorphism', option_b: 'Class, Object, Method, Variable', option_c: 'Public, Private, Protected, Default', option_d: 'Static, Final, Abstract, Interface', correct_option: 'a' },
      { question_text: 'What is an object in Java?', option_a: 'A blueprint for a class', option_b: 'An instance of a class', option_c: 'A method', option_d: 'A variable', correct_option: 'b' },
      { question_text: 'What is encapsulation?', option_a: 'Hiding implementation details and exposing a public interface', option_b: 'Reusing code from parent class', option_c: 'Defining multiple methods with same name', option_d: 'Creating abstract classes', correct_option: 'a' },
      { question_text: 'What keyword creates a new object?', option_a: 'create', option_b: 'make', option_c: 'object', option_d: 'new', correct_option: 'd' },
      { question_text: 'What is a constructor?', option_a: 'A method that destroys objects', option_b: 'A method called automatically when an object is created', option_c: 'A static method', option_d: 'A final method', correct_option: 'b' },
      // Medium
      { question_text: 'What is the "this" keyword used for in Java?', option_a: 'Refers to the current class instance', option_b: 'Refers to the parent class', option_c: 'Creates a new object', option_d: 'Calls a static method', correct_option: 'a' },
      { question_text: 'What is method overloading?', option_a: 'Overriding a parent method', option_b: 'Multiple methods with same name but different parameters', option_c: 'A method with too many lines', option_d: 'Calling a method recursively', correct_option: 'b' },
      { question_text: 'Can a constructor have a return type in Java?', option_a: 'Yes, it returns void', option_b: 'Yes, any type', option_c: 'No', option_d: 'Only if declared static', correct_option: 'c' },
      { question_text: 'What is the purpose of the "final" keyword on a class?', option_a: 'The class cannot be extended', option_b: 'The class cannot be instantiated', option_c: 'The class is abstract', option_d: 'The class is a singleton', correct_option: 'a' },
      { question_text: 'What is static binding in Java?', option_a: 'Method resolved at compile time (overloading)', option_b: 'Method resolved at runtime', option_c: 'Binding to static variables', option_d: 'Using the static keyword', correct_option: 'a' },
      // Hard
      { question_text: 'Can a class in Java have multiple constructors?', option_a: 'No', option_b: 'Yes, through constructor overloading', option_c: 'Only if the class is abstract', option_d: 'Only two constructors', correct_option: 'b' },
      { question_text: 'What is the difference between "==" and ".equals()" for objects?', option_a: 'No difference', option_b: '"==" checks reference equality; ".equals()" checks value equality', option_c: '"==" checks value; ".equals()" checks reference', option_d: 'Both check value equality', correct_option: 'b' },
      { question_text: 'What happens if a class does not define a constructor?', option_a: 'The class cannot be instantiated', option_b: 'Compiler provides a default no-arg constructor', option_c: 'A compile error occurs', option_d: 'The parent constructor is used', correct_option: 'b' },
    ],
  },
  {
    topic: 'Inheritance',
    questions: [
      // Easy
      { question_text: 'Which keyword is used to inherit a class in Java?', option_a: 'extends', option_b: 'implements', option_c: 'inherits', option_d: 'super', correct_option: 'a' },
      { question_text: 'Can a class inherit from multiple classes in Java?', option_a: 'Yes', option_b: 'No, Java does not support multiple class inheritance', option_c: 'Only with abstract classes', option_d: 'Yes, using implements', correct_option: 'b' },
      { question_text: 'Which keyword refers to the parent class?', option_a: 'parent', option_b: 'base', option_c: 'super', option_d: 'this', correct_option: 'c' },
      { question_text: 'What is the root class of all Java classes?', option_a: 'Base', option_b: 'Class', option_c: 'Object', option_d: 'Root', correct_option: 'c' },
      { question_text: 'What is method overriding?', option_a: 'Defining multiple methods with same name in one class', option_b: 'Redefining a parent class method in a child class', option_c: 'Calling a parent method', option_d: 'Hiding a variable', correct_option: 'b' },
      // Medium
      { question_text: 'What is the use of @Override annotation?', option_a: 'Required to override a method', option_b: 'Tells compiler the method is overriding a parent method', option_c: 'Makes a method final', option_d: 'Prevents method call', correct_option: 'b' },
      { question_text: 'Can a child class access private members of the parent class?', option_a: 'Yes, directly', option_b: 'No', option_c: 'Only through reflection', option_d: 'Yes, with super keyword', correct_option: 'b' },
      { question_text: 'What is a sealed class in Java?', option_a: 'A class with no constructors', option_b: 'A final class', option_c: 'A class that restricts which classes can extend it', option_d: 'An abstract class', correct_option: 'c' },
      { question_text: 'Which type of inheritance does Java achieve through interfaces?', option_a: 'Hybrid inheritance', option_b: 'Multiple inheritance', option_c: 'Hierarchical inheritance', option_d: 'Single inheritance', correct_option: 'b' },
      { question_text: 'When does constructor chaining using super() need to be the first statement?', option_a: 'Only in abstract classes', option_b: 'Always, in any constructor calling super()', option_c: 'Only in final classes', option_d: 'Only when overriding methods', correct_option: 'b' },
      // Hard
      { question_text: 'What is the diamond problem in Java and how is it resolved?', option_a: 'Stack overflow resolved by GC', option_b: 'Ambiguous method inheritance resolved using default methods in interfaces', option_c: 'Duplicate class names resolved by packages', option_d: 'Circular dependency resolved by abstract classes', correct_option: 'b' },
      { question_text: 'What is covariant return type in method overriding?', option_a: 'The overriding method can return a subtype', option_b: 'The overriding method must return void', option_c: 'The return type must match exactly', option_d: 'Overriding is not allowed', correct_option: 'a' },
      { question_text: 'Can a constructor be inherited in Java?', option_a: 'Yes', option_b: 'No, constructors are not inherited', option_c: 'Only no-arg constructors', option_d: 'Only if parent is abstract', correct_option: 'b' },
    ],
  },
  {
    topic: 'Polymorphism',
    questions: [
      // Easy
      { question_text: 'What is polymorphism?', option_a: 'One name, many forms', option_b: 'A class with many methods', option_c: 'Multiple inheritance', option_d: 'Method hiding', correct_option: 'a' },
      { question_text: 'Which is an example of compile-time polymorphism?', option_a: 'Method overriding', option_b: 'Method overloading', option_c: 'Interface implementation', option_d: 'Abstract methods', correct_option: 'b' },
      { question_text: 'Which is an example of runtime polymorphism?', option_a: 'Method overloading', option_b: 'Constructor chaining', option_c: 'Method overriding', option_d: 'Static methods', correct_option: 'c' },
      { question_text: 'What is dynamic dispatch in Java?', option_a: 'Calling a static method', option_b: 'Calling overridden methods via parent reference at runtime', option_c: 'Loading classes dynamically', option_d: 'Calling final methods', correct_option: 'b' },
      { question_text: 'Can static methods be overridden in Java?', option_a: 'Yes', option_b: 'No, they can only be hidden', option_c: 'Yes, using @Override', option_d: 'Only in abstract classes', correct_option: 'b' },
      // Medium
      { question_text: 'Animal a = new Dog(); — what type of reference is this?', option_a: 'Narrowing', option_b: 'Upcasting', option_c: 'Downcasting', option_d: 'Casting error', correct_option: 'b' },
      { question_text: 'What is downcasting?', option_a: 'Converting child to parent reference', option_b: 'Converting parent reference to child type', option_c: 'Widening conversion', option_d: 'Calling a parent method', correct_option: 'b' },
      { question_text: 'Which keyword checks if an object is an instance of a class?', option_a: 'typeof', option_b: 'is', option_c: 'instanceof', option_d: 'checktype', correct_option: 'c' },
      { question_text: 'What is method hiding in Java?', option_a: 'Making a method private', option_b: 'A static method in child class with same signature as parent static method', option_c: 'Overriding a final method', option_d: 'Calling super()', correct_option: 'b' },
      { question_text: 'What is the output: Animal a = new Dog(); a.speak(); — if Dog overrides speak()?', option_a: "Animal's speak() is called", option_b: "Dog's speak() is called", option_c: 'Compile error', option_d: 'Runtime error', correct_option: 'b' },
      // Hard
      { question_text: 'What is the difference between overloading and overriding?', option_a: 'No difference', option_b: 'Overloading is compile-time; overriding is runtime polymorphism', option_c: 'Overriding is compile-time; overloading is runtime', option_d: 'Overloading needs @Override', correct_option: 'b' },
      { question_text: 'Can a private method be overridden in Java?', option_a: 'Yes', option_b: 'No, private methods are not visible to subclasses', option_c: 'Yes, with @Override', option_d: 'Only in the same package', correct_option: 'b' },
      { question_text: 'What is the Pattern Matching for instanceof (Java 16+)?', option_a: 'A regex matching feature', option_b: 'Allows casting and binding in a single expression', option_c: 'A new loop syntax', option_d: 'A switch expression feature', correct_option: 'b' },
    ],
  },
  {
    topic: 'Abstraction & Interfaces',
    questions: [
      // Easy
      { question_text: 'Which keyword declares an abstract class?', option_a: 'interface', option_b: 'virtual', option_c: 'abstract', option_d: 'base', correct_option: 'c' },
      { question_text: 'Can you instantiate an abstract class?', option_a: 'Yes', option_b: 'No', option_c: 'Only with new keyword', option_d: 'Only via reflection', correct_option: 'b' },
      { question_text: 'Which keyword is used to define an interface?', option_a: 'abstract class', option_b: 'interface', option_c: 'implement', option_d: 'virtual', correct_option: 'b' },
      { question_text: 'What is the default modifier of methods in an interface (before Java 8)?', option_a: 'protected abstract', option_b: 'public abstract', option_c: 'private abstract', option_d: 'package-private', correct_option: 'b' },
      { question_text: 'Which keyword implements an interface?', option_a: 'extends', option_b: 'inherits', option_c: 'implements', option_d: 'uses', correct_option: 'c' },
      // Medium
      { question_text: 'What is a functional interface?', option_a: 'An interface with many methods', option_b: 'An interface with exactly one abstract method', option_c: 'An interface with default methods', option_d: 'An interface extending another interface', correct_option: 'b' },
      { question_text: 'Can an interface have a constructor?', option_a: 'Yes', option_b: 'No', option_c: 'Only default constructors', option_d: 'Only static constructors', correct_option: 'b' },
      { question_text: 'What is a default method in an interface (Java 8+)?', option_a: 'An abstract method', option_b: 'A method with a default implementation in the interface', option_c: 'A private method', option_d: 'A static method', correct_option: 'b' },
      { question_text: 'Can an interface extend another interface?', option_a: 'No', option_b: 'Yes, using extends', option_c: 'Yes, using implements', option_d: 'Only if both are functional interfaces', correct_option: 'b' },
      { question_text: 'What is the difference between abstract class and interface?', option_a: 'Abstract class can have constructors; interface cannot', option_b: 'Interface can have state; abstract class cannot', option_c: 'Both are same', option_d: 'Abstract class cannot have concrete methods', correct_option: 'a' },
      // Hard
      { question_text: 'Can a class implement multiple interfaces?', option_a: 'No', option_b: 'Yes', option_c: 'Only two', option_d: 'Only if they are functional interfaces', correct_option: 'b' },
      { question_text: 'What is a marker interface?', option_a: 'An interface with one method', option_b: 'An interface with no methods, used to mark a class', option_c: 'An interface with all default methods', option_d: 'An interface extending Object', correct_option: 'b' },
      { question_text: 'What happens when two interfaces have a default method with the same signature?', option_a: 'Compile error unless the class overrides the method', option_b: 'First interface method is used', option_c: 'Last interface method is used', option_d: 'Runtime exception', correct_option: 'a' },
    ],
  },
  {
    topic: 'Exception Handling',
    questions: [
      // Easy
      { question_text: 'Which keywords are used for exception handling in Java?', option_a: 'try, catch, finally', option_b: 'try, handle, end', option_c: 'check, except, done', option_d: 'error, catch, resolve', correct_option: 'a' },
      { question_text: 'What is an unchecked exception?', option_a: 'Exception checked at runtime e.g. NullPointerException', option_b: 'Exception that must be declared', option_c: 'Exception that cannot be caught', option_d: 'Checked by the IDE', correct_option: 'a' },
      { question_text: 'Which class is the parent of all exceptions?', option_a: 'Error', option_b: 'Throwable', option_c: 'RuntimeException', option_d: 'Exception', correct_option: 'b' },
      { question_text: 'What does the "finally" block do?', option_a: 'Executes only when an exception is thrown', option_b: 'Executes always, regardless of exception', option_c: 'Handles the exception', option_d: 'Re-throws the exception', correct_option: 'b' },
      { question_text: 'Which keyword is used to throw an exception manually?', option_a: 'raise', option_b: 'throws', option_c: 'throw', option_d: 'error', correct_option: 'c' },
      // Medium
      { question_text: 'What is the difference between throw and throws?', option_a: 'throw creates; throws declares', option_b: 'throw throws an exception; throws declares that a method may throw', option_c: 'No difference', option_d: 'throws is for unchecked exceptions', correct_option: 'b' },
      { question_text: 'What is a checked exception?', option_a: 'Runtime exception', option_b: 'Exception that must be handled or declared at compile time', option_c: 'Exception checked by the JVM', option_d: 'Exception not extending Throwable', correct_option: 'b' },
      { question_text: 'Can we have a try block without a catch block?', option_a: 'No', option_b: 'Yes, if there is a finally block', option_c: 'Yes, always', option_d: 'Only for checked exceptions', correct_option: 'b' },
      { question_text: 'What is a custom exception?', option_a: 'An exception thrown automatically by JVM', option_b: 'A user-defined class extending Exception', option_c: 'An exception from java.lang', option_d: 'An uncaught exception', correct_option: 'b' },
      { question_text: 'Which exception is thrown when dividing by zero?', option_a: 'MathException', option_b: 'DivisionByZeroException', option_c: 'ArithmeticException', option_d: 'RuntimeException', correct_option: 'c' },
      // Hard
      { question_text: 'What is try-with-resources in Java?', option_a: 'A try block with multiple catch blocks', option_b: 'Automatically closes resources that implement AutoCloseable', option_c: 'Allocates memory in try block', option_d: 'A thread-safe try block', correct_option: 'b' },
      { question_text: 'What is exception chaining?', option_a: 'Catching multiple exceptions', option_b: 'Wrapping one exception inside another to preserve context', option_c: 'Throwing multiple exceptions', option_d: 'Rethrowing the same exception', correct_option: 'b' },
      { question_text: 'Can we catch multiple exception types in one catch block (Java 7+)?', option_a: 'No', option_b: 'Yes, using | operator', option_c: 'Yes, using & operator', option_d: 'Yes, using comma', correct_option: 'b' },
    ],
  },
  {
    topic: 'Collections',
    questions: [
      // Easy
      { question_text: 'Which interface is the root of the Java Collections Framework?', option_a: 'List', option_b: 'Map', option_c: 'Collection', option_d: 'Set', correct_option: 'c' },
      { question_text: 'Which collection allows duplicate elements?', option_a: 'HashSet', option_b: 'TreeSet', option_c: 'ArrayList', option_d: 'LinkedHashSet', correct_option: 'c' },
      { question_text: 'Which collection maintains insertion order?', option_a: 'HashSet', option_b: 'HashMap', option_c: 'TreeSet', option_d: 'LinkedHashMap', correct_option: 'd' },
      { question_text: 'What data structure does HashMap use internally?', option_a: 'Tree', option_b: 'Array + LinkedList (hash buckets)', option_c: 'Stack', option_d: 'Queue', correct_option: 'b' },
      { question_text: 'Which List implementation provides O(1) access by index?', option_a: 'LinkedList', option_b: 'Vector', option_c: 'Stack', option_d: 'ArrayList', correct_option: 'd' },
      // Medium
      { question_text: 'What is the difference between ArrayList and LinkedList?', option_a: 'ArrayList uses linked nodes; LinkedList uses array', option_b: 'ArrayList is faster for random access; LinkedList is faster for insertions/deletions', option_c: 'LinkedList is thread-safe; ArrayList is not', option_d: 'No difference', correct_option: 'b' },
      { question_text: 'What is the initial capacity of ArrayList in Java?', option_a: '5', option_b: '20', option_c: '10', option_d: '16', correct_option: 'c' },
      { question_text: 'What is the difference between HashMap and Hashtable?', option_a: 'HashMap is synchronized; Hashtable is not', option_b: 'HashMap allows null keys; Hashtable does not', option_c: 'Both are same', option_d: 'Hashtable allows null keys', correct_option: 'b' },
      { question_text: 'Which collection sorts elements by natural order?', option_a: 'LinkedHashSet', option_b: 'TreeSet', option_c: 'HashSet', option_d: 'ArrayList', correct_option: 'b' },
      { question_text: 'How does a PriorityQueue work in Java?', option_a: 'LIFO order', option_b: 'FIFO order', option_c: 'Insertion order', option_d: 'Min-heap order by default', correct_option: 'd' },
      // Hard
      { question_text: 'What is ConcurrentHashMap and when to use it?', option_a: 'Same as HashMap but slower', option_b: 'Thread-safe HashMap allowing concurrent reads', option_c: 'Synchronized HashMap', option_d: 'Immutable HashMap', correct_option: 'b' },
      { question_text: 'What is the contract between hashCode() and equals() in Java?', option_a: 'No contract', option_b: 'If equals() is true, hashCode() must be same', option_c: 'hashCode must always be unique', option_d: 'equals() must call hashCode()', correct_option: 'b' },
      { question_text: 'What is the fail-fast behavior of iterators?', option_a: 'Iterator never throws exceptions', option_b: 'Iterator throws ConcurrentModificationException if collection is modified during iteration', option_c: 'Iterator locks the collection', option_d: 'Iterator skips modified elements', correct_option: 'b' },
    ],
  },
  {
    topic: 'File Handling',
    questions: [
      // Easy
      { question_text: 'Which class is used to read text from a file in Java?', option_a: 'FileWriter', option_b: 'BufferedWriter', option_c: 'FileReader', option_d: 'FileInputStream', correct_option: 'c' },
      { question_text: 'Which class writes text to a file?', option_a: 'FileReader', option_b: 'FileWriter', option_c: 'Scanner', option_d: 'PrintStream', correct_option: 'b' },
      { question_text: 'Which method creates a new file in Java?', option_a: 'File.open()', option_b: 'File.create()', option_c: 'file.createNewFile()', option_d: 'new File().make()', correct_option: 'c' },
      { question_text: 'What exception is thrown if a file is not found?', option_a: 'IOException', option_b: 'FileException', option_c: 'MissingFileException', option_d: 'FileNotFoundException', correct_option: 'd' },
      { question_text: 'Which class provides buffered reading of a file?', option_a: 'Scanner', option_b: 'FileReader', option_c: 'BufferedReader', option_d: 'InputStreamReader', correct_option: 'c' },
      // Medium
      { question_text: 'What does BufferedReader.readLine() return at end of file?', option_a: '""', option_b: 'EOF', option_c: 'null', option_d: '-1', correct_option: 'c' },
      { question_text: 'What does FileWriter(file, true) do?', option_a: 'Overwrites the file', option_b: 'Deletes file and creates new', option_c: 'Appends to the file', option_d: 'Reads the file', correct_option: 'c' },
      { question_text: 'What is the NIO package used for in Java?', option_a: 'Networking only', option_b: 'Non-blocking I/O and improved file operations', option_c: 'New Integer Operations', option_d: 'Number formatting', correct_option: 'b' },
      { question_text: 'Which class in java.nio.file reads all bytes from a file easily?', option_a: 'FileUtils', option_b: 'Files', option_c: 'Path', option_d: 'Paths', correct_option: 'b' },
      { question_text: 'Why should streams always be closed after use?', option_a: 'To free memory', option_b: 'To avoid file locking and resource leaks', option_c: 'To prevent GC delays', option_d: 'Mandatory by compiler', correct_option: 'b' },
      // Hard
      { question_text: 'What is serialization in Java?', option_a: 'Sorting objects', option_b: 'Converting an object to a byte stream for storage or transfer', option_c: 'Encrypting data', option_d: 'Parsing JSON', correct_option: 'b' },
      { question_text: 'What does the transient keyword do in serialization?', option_a: 'Marks a field for serialization', option_b: 'Excludes a field from serialization', option_c: 'Marks a class as serializable', option_d: 'Ensures thread safety', correct_option: 'b' },
      { question_text: 'What is RandomAccessFile in Java?', option_a: 'A file that can be read randomly by GC', option_b: 'A class that allows reading and writing at any position in a file', option_c: 'A thread-safe file reader', option_d: 'A file with random content', correct_option: 'b' },
    ],
  },
  {
    topic: 'Multithreading',
    questions: [
      // Easy
      { question_text: 'How do you create a thread in Java?', option_a: 'Extending Thread or implementing Runnable', option_b: 'Using the "thread" keyword', option_c: 'Calling run() directly', option_d: 'Using a ThreadPool only', correct_option: 'a' },
      { question_text: 'Which method starts a thread?', option_a: 'run()', option_b: 'begin()', option_c: 'execute()', option_d: 'start()', correct_option: 'd' },
      { question_text: 'What is a deadlock?', option_a: 'A thread that runs forever', option_b: 'Two threads waiting for each other\'s lock indefinitely', option_c: 'A thread that throws an exception', option_d: 'A thread that uses too much memory', correct_option: 'b' },
      { question_text: 'Which keyword ensures only one thread accesses a method at a time?', option_a: 'volatile', option_b: 'atomic', option_c: 'synchronized', option_d: 'locked', correct_option: 'c' },
      { question_text: 'What does Thread.sleep(1000) do?', option_a: 'Stops the thread permanently', option_b: 'Pauses the thread for 1000 milliseconds', option_c: 'Puts thread in waiting state until notified', option_d: 'Terminates the thread', correct_option: 'b' },
      // Medium
      { question_text: 'What is the difference between process and thread?', option_a: 'No difference', option_b: 'Process has its own memory; threads share memory within a process', option_c: 'Thread has its own memory', option_d: 'Process is faster than thread', correct_option: 'b' },
      { question_text: 'What is the volatile keyword used for?', option_a: 'Locks a variable', option_b: 'Ensures visibility of changes across threads without locking', option_c: 'Makes a variable immutable', option_d: 'Prevents serialization', correct_option: 'b' },
      { question_text: 'What is a race condition?', option_a: 'Threads competing for CPU', option_b: 'Multiple threads accessing shared state concurrently causing unexpected results', option_c: 'A thread with high priority', option_d: 'A deadlock scenario', correct_option: 'b' },
      { question_text: 'What is ExecutorService in Java?', option_a: 'An interface for managing thread pools', option_b: 'A class for file execution', option_c: 'A method scheduler', option_d: 'A garbage collector', correct_option: 'a' },
      { question_text: 'Which thread state means the thread is waiting for I/O?', option_a: 'RUNNABLE', option_b: 'BLOCKED', option_c: 'WAITING', option_d: 'TIMED_WAITING', correct_option: 'b' },
      // Hard
      { question_text: 'What is the Java Memory Model (JMM)?', option_a: 'A specification for how JVM manages RAM', option_b: 'Rules defining how threads interact through memory', option_c: 'A garbage collection algorithm', option_d: 'A class loader mechanism', correct_option: 'b' },
      { question_text: 'What is a ReentrantLock and how does it differ from synchronized?', option_a: 'Same as synchronized', option_b: 'Provides more flexibility: tryLock, fairness, interruptibility', option_c: 'Less powerful than synchronized', option_d: 'Used only for static methods', correct_option: 'b' },
      { question_text: 'What is the happens-before relationship in Java concurrency?', option_a: 'Thread execution order guarantee', option_b: 'A guarantee that writes by one thread are visible to another thread', option_c: 'Priority scheduling rule', option_d: 'A memory allocation rule', correct_option: 'b' },
    ],
  },
  {
    topic: 'JDBC',
    questions: [
      // Easy
      { question_text: 'What does JDBC stand for?', option_a: 'Java Database Connector Bridge', option_b: 'Java DataBase Connectivity', option_c: 'Java Dynamic Base Class', option_d: 'Java Data Binding Class', correct_option: 'b' },
      { question_text: 'Which interface is used to execute SQL queries in JDBC?', option_a: 'Connection', option_b: 'ResultSet', option_c: 'Statement', option_d: 'DriverManager', correct_option: 'c' },
      { question_text: 'What does DriverManager.getConnection() return?', option_a: 'Statement', option_b: 'ResultSet', option_c: 'Connection', option_d: 'DataSource', correct_option: 'c' },
      { question_text: 'Which method executes a SELECT query in JDBC?', option_a: 'execute()', option_b: 'executeQuery()', option_c: 'executeUpdate()', option_d: 'runQuery()', correct_option: 'b' },
      { question_text: 'Which method executes INSERT/UPDATE/DELETE in JDBC?', option_a: 'executeQuery()', option_b: 'execute()', option_c: 'executeUpdate()', option_d: 'runUpdate()', correct_option: 'c' },
      // Medium
      { question_text: 'What is a PreparedStatement and why use it?', option_a: 'A precompiled SQL statement that prevents SQL injection', option_b: 'A Statement for stored procedures', option_c: 'A faster version of ResultSet', option_d: 'An auto-commit statement', correct_option: 'a' },
      { question_text: 'What is the JDBC URL format for MySQL?', option_a: 'mysql://localhost:3306/db', option_b: 'jdbc:mysql://localhost:3306/db', option_c: 'jdbc://mysql:3306/db', option_d: 'sql:mysql://localhost/db', correct_option: 'b' },
      { question_text: 'What does ResultSet.next() do?', option_a: 'Executes the next query', option_b: 'Moves cursor to next row and returns true if row exists', option_c: 'Returns the next column', option_d: 'Closes the result set', correct_option: 'b' },
      { question_text: 'What is connection pooling in JDBC?', option_a: 'Storing ResultSets', option_b: 'Reusing a pool of pre-established database connections for efficiency', option_c: 'Caching SQL queries', option_d: 'A pool of JDBC drivers', correct_option: 'b' },
      { question_text: 'What is a CallableStatement used for?', option_a: 'Simple SELECT queries', option_b: 'Calling stored procedures in the database', option_c: 'Batch updates', option_d: 'Streaming large data', correct_option: 'b' },
      // Hard
      { question_text: 'What is the difference between Statement and PreparedStatement?', option_a: 'No difference', option_b: 'PreparedStatement is precompiled, safer, and faster for repeated queries', option_c: 'Statement supports batch; PreparedStatement does not', option_d: 'PreparedStatement is for DDL only', correct_option: 'b' },
      { question_text: 'How do you implement a transaction in JDBC?', option_a: 'Transactions are automatic in JDBC', option_b: 'Set auto-commit to false, execute statements, then commit or rollback', option_c: 'Use @Transactional annotation', option_d: 'Use execute() method', correct_option: 'b' },
      { question_text: 'What is a DataSource in JDBC?', option_a: 'Same as DriverManager', option_b: 'A factory for database connections supporting pooling and JNDI lookup', option_c: 'A result set container', option_d: 'A SQL file reader', correct_option: 'b' },
    ],
  },
  {
    topic: 'Java 8 Features',
    questions: [
      // Easy
      { question_text: 'What is a lambda expression in Java?', option_a: 'A new loop syntax', option_b: 'A concise anonymous function', option_c: 'A new class type', option_d: 'A static method', correct_option: 'b' },
      { question_text: 'What is the Stream API used for?', option_a: 'File I/O streams', option_b: 'Functional-style processing of collections', option_c: 'Network streaming', option_d: 'Multithreading', correct_option: 'b' },
      { question_text: 'What does Optional class help avoid?', option_a: 'StackOverflowError', option_b: 'ClassCastException', option_c: 'NullPointerException', option_d: 'DeadlockException', correct_option: 'c' },
      { question_text: 'Which functional interface takes no input and returns a result?', option_a: 'Consumer', option_b: 'Predicate', option_c: 'Supplier', option_d: 'Function', correct_option: 'c' },
      { question_text: 'Which annotation marks a functional interface?', option_a: '@FunctionalInterface', option_b: '@Lambda', option_c: '@Interface', option_d: '@SingleMethod', correct_option: 'a' },
      // Medium
      { question_text: 'What is method reference in Java 8?', option_a: 'Calling a method by its address', option_b: 'A shorthand for a lambda calling an existing method, using ::', option_c: 'A reflection technique', option_d: 'A way to override methods', correct_option: 'b' },
      { question_text: 'What does Stream.filter() do?', option_a: 'Transforms elements', option_b: 'Returns elements matching a predicate', option_c: 'Collects elements into a list', option_d: 'Sorts the stream', correct_option: 'b' },
      { question_text: 'What is the difference between map() and flatMap() in streams?', option_a: 'map() flattens nested streams; flatMap() does not', option_b: 'map() transforms each element; flatMap() flattens nested streams', option_c: 'No difference', option_d: 'flatMap() only works on collections', correct_option: 'b' },
      { question_text: 'What new date/time API was introduced in Java 8?', option_a: 'java.util.Date (updated)', option_b: 'java.time package (LocalDate, LocalTime, etc.)', option_c: 'java.calendar package', option_d: 'java.date package', correct_option: 'b' },
      { question_text: 'What does Collectors.groupingBy() do?', option_a: 'Sorts a stream', option_b: 'Groups stream elements by a classifier function into a Map', option_c: 'Filters null elements', option_d: 'Joins strings', correct_option: 'b' },
      // Hard
      { question_text: 'What is the difference between intermediate and terminal stream operations?', option_a: 'No difference', option_b: 'Intermediate operations are lazy and return streams; terminal operations trigger processing', option_c: 'Terminal operations return streams', option_d: 'Intermediate operations execute immediately', correct_option: 'b' },
      { question_text: 'What does CompletableFuture provide in Java 8?', option_a: 'Synchronous computation', option_b: 'Asynchronous programming with composable async tasks', option_c: 'Thread pool management', option_d: 'Database connection pooling', correct_option: 'b' },
      { question_text: 'What is the purpose of the Predicate.and(), or(), negate() methods?', option_a: 'Math operations', option_b: 'Composing multiple predicates logically', option_c: 'Collection operations', option_d: 'Thread operations', correct_option: 'b' },
    ],
  },
];

// ─── Main Insertion Logic ──────────────────────────────────────────────────────
(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // 1) Find the Java course by Thulasi
    const [courses] = await conn.execute(
      `SELECT c.id, c.title FROM courses c
       JOIN users u ON c.instructor_id = u.id
       WHERE u.email = ? AND c.title LIKE '%Java%' LIMIT 1`,
      ['thulasimanid.cb23@bitsathy.ac.in']
    );

    if (courses.length === 0) {
      console.error('ERROR: No Java course found for thulasimanid.cb23@bitsathy.ac.in');
      process.exit(1);
    }

    const course = courses[0];
    console.log(`Found course: "${course.title}" (id=${course.id})`);

    // 2) Find or create a quiz named "Java Question Bank"
    let [quizRows] = await conn.execute(
      'SELECT id FROM quizzes WHERE course_id = ? AND title = ?',
      [course.id, 'Java Question Bank']
    );

    let quizId;
    if (quizRows.length > 0) {
      quizId = quizRows[0].id;
      console.log(`Using existing quiz "Java Question Bank" (id=${quizId})`);
    } else {
      const [result] = await conn.execute(
        'INSERT INTO quizzes (course_id, title, passing_score_pct) VALUES (?, ?, ?)',
        [course.id, 'Java Question Bank', 60]
      );
      quizId = result.insertId;
      console.log(`Created quiz "Java Question Bank" (id=${quizId})`);
    }

    // 3) Get current max sort_order
    const [maxRows] = await conn.execute(
      'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM quiz_questions WHERE quiz_id = ?',
      [quizId]
    );
    let sortOrder = maxRows[0].max_order;

    // 4) Insert all questions by topic
    let totalInserted = 0;
    await conn.beginTransaction();

    for (const { topic, questions } of TOPICS) {
      for (const q of questions) {
        sortOrder++;
        await conn.execute(
          `INSERT INTO quiz_questions (quiz_id, topic, question_text, option_a, option_b, option_c, option_d, correct_option, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [quizId, topic, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, sortOrder]
        );
        totalInserted++;
      }
      console.log(`  ✔ Inserted ${questions.length} questions for topic: ${topic}`);
    }

    await conn.commit();
    console.log(`\n✅ SUCCESS: Inserted ${totalInserted} questions across ${TOPICS.length} topics.`);
    console.log(`   Quiz ID: ${quizId} | Course: "${course.title}"`);

  } catch (err) {
    await conn.rollback();
    console.error('ERROR:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
})();
